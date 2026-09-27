/**
 * AWS Lambda Handler: generateInterviewQuestions
 * 
 * Invoked by API Gateway: POST /interview/generate-questions
 * Body: { role: string, topic: string, difficulty: string, studentId?: string }
 * 
 * Returns: { studentId, sessionId, role, topic, difficulty, questions: [{ q, studentAnswer, feedback, score }] }
 */

const { bedrock, ddbDocClient, InvokeModelCommand, PutCommand, DEFAULT_BEDROCK_MODEL_ID } = require("./awsClients");

// System prompt for Interview Coach (Question Generation)
const SYSTEM_PROMPT = `You are CampusAid's Interview Coach, generating practice questions.
Given a role, topic, and difficulty, output ONLY this JSON shape:
{ "questions": ["...", "...", "...", "...", "..."] }
Generate exactly 5 questions appropriate to the given difficulty level.
Output the JSON object only — no other text, no markdown code fences.`;

const INTERVIEW_GENERATE_PROMPT = SYSTEM_PROMPT;

/**
 * Safely parses a JSON response from the AI.
 * Strips markdown code fences (```json or ```) if present,
 * and wraps JSON.parse in a try/catch that falls back to a clear error message instead of crashing.
 * 
 * @param {string} rawResponse - Raw string output from the AI model
 * @returns {object} Parsed JSON object, or fallback object with clear error message
 */
function parseAIJsonResponse(rawResponse) {
  if (typeof rawResponse === "object" && rawResponse !== null) {
    return rawResponse;
  }
  if (!rawResponse || typeof rawResponse !== "string") {
    return { error: "Failed to parse AI response: Input must be a non-empty string." };
  }

  let cleaned = rawResponse.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  } else {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse error on AI response:", err.message);
    return { error: `Failed to parse AI JSON response: ${err.message}` };
  }
}

exports.handler = async (event, context) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : (event.body || {});
    const {
      role = "Cloud & DevOps Engineer",
      topic = "Docker & Containerization",
      difficulty = "Mid-level",
      studentId = "stu_c9842a1"
    } = body;

    // --- Live AWS Bedrock Invocation ---
    if (bedrock && InvokeModelCommand) {
      try {
        const userPrompt = `Role: ${role}, Topic: ${topic}, Difficulty: ${difficulty}`;
        const bedrockResponse = await bedrock.send(new InvokeModelCommand({
          modelId: DEFAULT_BEDROCK_MODEL_ID,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }]
          })
        }));

        const rawResult = new TextDecoder().decode(bedrockResponse.body);
        const result = JSON.parse(rawResult);
        const textContent = result.content && result.content[0] ? result.content[0].text : rawResult;
        const parsedData = parseAIJsonResponse(textContent);

        if (!parsedData.error && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
          const liveSessionRecord = {
            studentId,
            sessionId: "int_" + Date.now(),
            role,
            topic,
            difficulty,
            questions: parsedData.questions.map((q) => ({
              q: typeof q === "string" ? q : (q.q || JSON.stringify(q)),
              studentAnswer: "",
              feedback: null,
              score: null
            }))
          };

          // Save session to DynamoDB Table CampusAid_InterviewSessions
          if (ddbDocClient && PutCommand) {
            try {
              await ddbDocClient.send(new PutCommand({
                TableName: process.env.DYNAMODB_INTERVIEW_SESSIONS_TABLE || "CampusAid_InterviewSessions",
                Item: liveSessionRecord
              }));
            } catch (ddbErr) {
              console.warn("DynamoDB Interview Session save warning:", ddbErr.message);
            }
          }

          return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify(liveSessionRecord)
          };
        }
      } catch (liveErr) {
        console.warn("Live Bedrock interview questions call unavailable, falling back to mock:", liveErr.message);
      }
    }

    const mockQuestionTexts = [
      `Explain the core architectural principles of ${topic} and how it solves scalability challenges for a ${role}.`,
      `How do you diagnose and debug latency bottlenecks or container exit errors in a high-traffic production system?`,
      `Compare the performance, security, and complexity trade-offs of this approach versus alternative industry patterns.`,
      `What happens under the hood when a failure or network partition occurs in this layer?`,
      `Walk through how you would configure automated health checks and metrics monitoring for this in AWS CloudWatch.`
    ];

    const sessionId = "int_" + Math.random().toString(36).substring(2, 9);
    const sessionRecord = {
      studentId,
      sessionId,
      role,
      topic,
      difficulty,
      questions: mockQuestionTexts.map((q) => ({
        q,
        studentAnswer: "",
        feedback: null,
        score: null
      }))
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify(sessionRecord)
    };
  } catch (error) {
    console.error("Error in generateInterviewQuestions handler:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error", message: error.message })
    };
  }
};

exports.SYSTEM_PROMPT = SYSTEM_PROMPT;
exports.INTERVIEW_GENERATE_PROMPT = INTERVIEW_GENERATE_PROMPT;
exports.parseAIJsonResponse = parseAIJsonResponse;

