/**
 * AWS Lambda Handler: generateRoadmap
 * 
 * Invoked by API Gateway: POST /roadmap/generate
 * Body: { year: string, branch: string, goal: string, studentId?: string }
 * 
 * Returns: { studentId, roadmapId, targetRole, phases: [{ name, items: [{ skill, done }] }] }
 */

const { bedrock, ddbDocClient, InvokeModelCommand, PutCommand, DEFAULT_BEDROCK_MODEL_ID } = require("./awsClients");

// System prompt for Career Roadmap Generator
const SYSTEM_PROMPT = `You are CampusAid's Career Roadmap generator.
Input: student's year, branch, and target career.
Output ONLY valid JSON matching this shape:
{
  "phases": [
    { "name": "Phase 1", "items": ["Python", "Linux"] },
    { "name": "Phase 2", "items": ["AWS fundamentals", "Networking"] }
  ]
}
Order phases from foundational to advanced. 3-5 phases, 2-4 items each.
Your entire response must be the JSON object only — no greeting, no
explanation, no markdown code fences.
If the student's branch has little direct overlap with the target career,
still build a realistic roadmap assuming they're starting from general
CS fundamentals.`;

const ROADMAP_AI_PROMPT = SYSTEM_PROMPT;

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
    const { year = "3rd Year", branch = "Computer Science", goal = "Cloud & DevOps Solutions Architect", studentId = "stu_c9842a1" } = body;

    // --- Live AWS Bedrock Invocation ---
    if (bedrock && InvokeModelCommand) {
      try {
        const userPrompt = `Year: ${year}, Branch: ${branch}, Target Career: ${goal}`;
        const bedrockResponse = await bedrock.send(new InvokeModelCommand({
          modelId: DEFAULT_BEDROCK_MODEL_ID,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1500,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }]
          })
        }));

        const rawResult = new TextDecoder().decode(bedrockResponse.body);
        const result = JSON.parse(rawResult);
        const textContent = result.content && result.content[0] ? result.content[0].text : rawResult;
        const parsedData = parseAIJsonResponse(textContent);

        if (!parsedData.error && Array.isArray(parsedData.phases) && parsedData.phases.length > 0) {
          const liveRoadmapPayload = {
            studentId,
            roadmapId: "rdm_" + Date.now(),
            targetRole: goal,
            phases: parsedData.phases.map((p) => ({
              name: p.name,
              items: (p.items || []).map((item) =>
                typeof item === "string" ? { skill: item, done: false } : item
              )
            }))
          };

          // Save to DynamoDB Table CampusAid_Roadmaps
          if (ddbDocClient && PutCommand) {
            try {
              await ddbDocClient.send(new PutCommand({
                TableName: process.env.DYNAMODB_ROADMAPS_TABLE || "CampusAid_Roadmaps",
                Item: liveRoadmapPayload
              }));
            } catch (ddbErr) {
              console.warn("DynamoDB Roadmap save warning:", ddbErr.message);
            }
          }

          return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify(liveRoadmapPayload)
          };
        }
      } catch (liveErr) {
        console.warn("Live Bedrock roadmap call unavailable, falling back to mock:", liveErr.message);
      }
    }

    const roadmapPayload = {
      studentId,
      roadmapId: "rdm_" + Math.random().toString(36).substring(2, 9),
      targetRole: goal,
      phases: [
        {
          name: "Phase 1: Core Fundamentals & Operating Systems",
          items: [
            { skill: "Linux CLI & Bash Scripting", done: true },
            { skill: "TCP/IP Networking, DNS, CIDR Subnetting", done: true },
            { skill: "Data Structures & Systems Programming", done: true }
          ]
        },
        {
          name: "Phase 2: Cloud Core & Infrastructure",
          items: [
            { skill: "AWS IAM & Security Posture", done: true },
            { skill: "AWS VPC Architecture & Route Tables", done: true },
            { skill: "AWS Lambda & API Gateway Serverless", done: false },
            { skill: "Amazon S3 & DynamoDB Data Modeling", done: false }
          ]
        },
        {
          name: "Phase 3: Containers & Orchestration",
          items: [
            { skill: "Docker Multi-Stage Builds & Optimization", done: false },
            { skill: "Kubernetes Pods, Services & Ingress", done: false },
            { skill: "Terraform Infrastructure as Code (IaC)", done: false }
          ]
        },
        {
          name: "Phase 4: Production SRE & Observability",
          items: [
            { skill: "CI/CD Automation with GitHub Actions", done: false },
            { skill: "Amazon CloudWatch Alarms & Distributed Tracing", done: false },
            { skill: "High Availability & Multi-Region Disaster Recovery", done: false }
          ]
        }
      ]
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify(roadmapPayload)
    };
  } catch (error) {
    console.error("Error in generateRoadmap handler:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error", message: error.message })
    };
  }
};

exports.SYSTEM_PROMPT = SYSTEM_PROMPT;
exports.ROADMAP_AI_PROMPT = ROADMAP_AI_PROMPT;
exports.parseAIJsonResponse = parseAIJsonResponse;

