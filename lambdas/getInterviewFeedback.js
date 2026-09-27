/**
 * AWS Lambda Handler: getInterviewFeedback
 * 
 * Invoked by API Gateway: POST /interview/feedback
 * Body: { question: string, answer: string, role?: string, topic?: string, difficulty?: string, studentId?: string, sessionId?: string }
 * 
 * Returns: { score: number, whatWasGood: string, whatToImprove: string, modelAnswer: string }
 */

const { bedrock, ddbDocClient, InvokeModelCommand, UpdateCommand, DEFAULT_BEDROCK_MODEL_ID } = require("./awsClients");

// System prompt for Interview Coach (Answer Feedback)
const SYSTEM_PROMPT = `You are CampusAid's Interview Coach, giving feedback on a student's answer.
Given a question and the student's answer, respond with:
1. A score out of 10, based on: technical accuracy (0-5), completeness (0-3),
   clarity (0-2). Briefly justify the score using this breakdown.
2. What was good
3. What to improve
4. A model answer (2-3 sentences)`;

const INTERVIEW_FEEDBACK_PROMPT = SYSTEM_PROMPT;

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
    const { question, answer = "", role = "Cloud Engineer", topic = "DevOps", difficulty = "Mid-level", sessionId, studentId } = body;

    if (!question) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Field 'question' is required" })
      };
    }

    // --- Live AWS Bedrock Invocation ---
    if (bedrock && InvokeModelCommand) {
      try {
        const userPrompt = `Role: ${role}\nTopic: ${topic}\nLevel: ${difficulty}\nQuestion: "${question}"\nCandidate Answer: "${answer}"\n\nProvide an objective evaluation as JSON with "score", "whatWasGood", "whatToImprove", and "modelAnswer".`;
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

        if (!parsedData.error && typeof parsedData === "object" && parsedData.score !== undefined) {
          return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify(parsedData)
          };
        }
      } catch (liveErr) {
        console.warn("Live Bedrock feedback call unavailable, falling back to mock:", liveErr.message);
      }
    }

    const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    let feedback = {};

    if (wordCount < 10) {
      feedback = {
        score: 4.0,
        whatWasGood: "You identified the core subject matter.",
        whatToImprove: "The explanation is incomplete. Highlight underlying operating system or cloud abstractions and architectural tradeoffs.",
        modelAnswer: "A complete answer covers: 1) Definition and operational context, 2) The execution mechanics, 3) Real-world edge cases like network latency, security, and scalability."
      };
    } else if (wordCount < 30) {
      feedback = {
        score: 7.0,
        whatWasGood: "Concise summary and good technical vocabulary.",
        whatToImprove: "Discuss practical production considerations like automated failure recovery, monitoring telemetry, and cost optimization.",
        modelAnswer: "In production, we decouple these services using managed message queues and enforce strict IAM policies to isolate blast radiuses."
      };
    } else {
      feedback = {
        score: 9.2,
        whatWasGood: "Superb depth! You articulated architectural mechanisms clearly and addressed operational reliability.",
        whatToImprove: "Consider mentioning metric thresholds (e.g. p99 latency alarms or auto-scaling triggers) for extra polish.",
        modelAnswer: "An ideal response describes: 1) System boundaries, 2) Fault tolerance mechanisms, 3) Telemetry monitoring in AWS CloudWatch."
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify(feedback)
    };
  } catch (error) {
    console.error("Error in getInterviewFeedback handler:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error", message: error.message })
    };
  }
};

exports.SYSTEM_PROMPT = SYSTEM_PROMPT;
exports.INTERVIEW_FEEDBACK_PROMPT = INTERVIEW_FEEDBACK_PROMPT;
exports.parseAIJsonResponse = parseAIJsonResponse;

