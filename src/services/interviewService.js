/**
 * CampusAid AI - Interview Prep Service
 * 
 * Target AWS Integration:
 * - Amazon Bedrock: Question generation and answer grading with Rubric Prompt
 * - DynamoDB Table: CampusAid_InterviewSessions (Partition Key: studentId, Sort Key: sessionId)
 * 
 * Matches Data Structure:
 * InterviewSession: { studentId, sessionId, role, topic, difficulty, questions: [{ q, studentAnswer, feedback, score }] }
 */

// Curated question banks for realistic mock generation across roles & topics
const QUESTION_BANK = {
  "Cloud & DevOps Engineer": {
    "Docker & Containerization": {
      "Junior": [
        "What is the difference between a Docker image and a Docker container?",
        "Why is it recommended to use lightweight base images like Alpine Linux in Docker?",
        "Explain what the EXPOSE instruction does in a Dockerfile.",
        "How do Docker volumes provide persistent storage across container restarts?",
        "What is the role of .dockerignore and why is it important for build speed and security?"
      ],
      "Mid-level": [
        "Explain how Docker multi-stage builds help optimize final container image sizes and reduce vulnerabilities.",
        "How does the copy-on-write (CoW) mechanism in Docker storage drivers work during image layering?",
        "What is the difference between CMD and ENTRYPOINT instructions in a Dockerfile, and when would you combine them?",
        "How would you troubleshoot a container that immediately exits with status code 137 upon startup?",
        "Describe the security risks of running containers as root and how the USER directive mitigates them."
      ],
      "Senior": [
        "Design a secure, highly-optimized container build pipeline for an enterprise microservice with zero root privileges.",
        "Compare Docker overlay networking with host and macvlan network drivers in high-throughput low-latency systems.",
        "How do cgroups v2 and Linux namespaces isolate CPU, memory, and PID limits in container runtimes?",
        "How would you handle container image scanning and signature verification using Cosign / Notary in a GitOps workflow?",
        "What strategies do you use to debug a container encountering memory leaks leading to OOM-killer evictions in Kubernetes?"
      ]
    },
    "AWS Infrastructure": {
      "Junior": [
        "What is the difference between Amazon EC2 and AWS Lambda in terms of management and pricing?",
        "Explain the purpose of an Amazon S3 Bucket Policy versus an IAM Policy.",
        "What are Availability Zones (AZs) in AWS and why do we deploy across multiple AZs?",
        "What is the difference between a public subnet and a private subnet in an AWS VPC?",
        "Explain the purpose of AWS CloudWatch and how alarms can trigger automated actions."
      ],
      "Mid-level": [
        "Walk me through configuring a high-availability VPC with public/private subnets, NAT Gateways, and an Application Load Balancer.",
        "How does DynamoDB auto-scaling handle sudden, unpredictable spikes in read/write capacity units?",
        "Describe the security best practice of IAM Roles for EC2/Lambda versus hardcoding long-lived access keys.",
        "What is the difference between an Application Load Balancer (ALB) and a Network Load Balancer (NLB)?",
        "How would you architect cross-region disaster recovery for an S3-backed web application with an RPO of 15 minutes?"
      ],
      "Senior": [
        "Design a multi-account AWS architecture using AWS Organizations, Control Tower, and Transit Gateway for 50+ microservices.",
        "How do you implement least-privilege permission boundaries and SCPs (Service Control Policies) across developer accounts?",
        "Explain how AWS Global Accelerator optimizes TCP/UDP routing compared to standard Amazon CloudFront edge caching.",
        "Describe a cost optimization audit strategy for an AWS bill exceeding $100k/month dominated by data transfer and idle compute.",
        "How do you handle zero-downtime database migrations with minimal lag between Amazon Aurora PostgreSQL clusters?"
      ]
    }
  },
  "Full Stack Developer": {
    "System Design & APIs": {
      "Junior": [
        "What is the difference between HTTP GET and POST requests in RESTful API design?",
        "Why is CORS (Cross-Origin Resource Sharing) enforced by browsers and how do you configure it on a backend server?",
        "Explain the difference between synchronous and asynchronous code execution in JavaScript.",
        "What are HTTP status codes 401 Unauthorized vs 403 Forbidden?",
        "How does client-side state differ from server-side database state in a web application?"
      ],
      "Mid-level": [
        "How do you implement token-based authentication using JWTs with short-lived access tokens and refresh tokens in HTTP-only cookies?",
        "Compare SQL databases (e.g., PostgreSQL) with NoSQL databases (e.g., DynamoDB/MongoDB) regarding schema flexibility, indexing, and ACID guarantees.",
        "Explain how database connection pooling works and why serverless environments need tools like RDS Proxy.",
        "How would you design an API rate limiter to prevent DDoS or abuse from specific client IP addresses or API keys?",
        "What is optimistic concurrency control versus pessimistic locking when two users update the same record simultaneously?"
      ],
      "Senior": [
        "Architect a real-time collaborative document editing platform (similar to Google Docs) handling 10,000 concurrent updates per second.",
        "Explain the trade-offs between WebSockets, Server-Sent Events (SSE), and Long Polling for real-time notifications.",
        "How do you design an idempotent payment processing endpoint that safely survives network timeouts and client retries?",
        "Describe how you would decompose a monolithic backend into event-driven microservices using Apache Kafka or AWS EventBridge.",
        "How do you ensure zero-downtime database schema migrations when renaming or removing a widely-used column?"
      ]
    }
  }
};

// Fallback questions for any other combinations
const DEFAULT_QUESTIONS = [
  "Explain the core architectural principles behind this technology and how it scales in production.",
  "What is the most challenging bug or race condition you might encounter when using this tool, and how would you diagnose it?",
  "How does this system guarantee high availability and fault tolerance during network partitioning?",
  "Describe the security considerations and threat model when exposing this component to public traffic.",
  "If you had to optimize this implementation for a 10x surge in concurrent requests, what bottlenecks would you address first?"
];

// Prompt constants for Interview Prep
export const INTERVIEW_GENERATE_PROMPT = `You are CampusAid's Interview Coach, generating practice questions.
Given a role, topic, and difficulty, output ONLY this JSON shape:
{ "questions": ["...", "...", "...", "...", "..."] }
Generate exactly 5 questions appropriate to the given difficulty level.
Output the JSON object only — no other text, no markdown code fences.`;

export const INTERVIEW_FEEDBACK_PROMPT = `You are CampusAid's Interview Coach, giving feedback on a student's answer.
Given a question and the student's answer, respond with:
1. A score out of 10, based on: technical accuracy (0-5), completeness (0-3),
   clarity (0-2). Briefly justify the score using this breakdown.
2. What was good
3. What to improve
4. A model answer (2-3 sentences)`;

export const SYSTEM_PROMPT = INTERVIEW_GENERATE_PROMPT;

/**
 * Safely parses a JSON response from the AI.
 * Strips markdown code fences (```json or ```) if present,
 * and wraps JSON.parse in a try/catch that falls back to a clear error message instead of crashing.
 * 
 * @param {string} rawResponse - Raw string output from the AI model
 * @returns {object} Parsed JSON object, or fallback object with clear error message
 */
export function parseAIJsonResponse(rawResponse) {
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

/**
 * Generate 5 mock interview questions matching session shape
 * 
 * @param {string} role 
 * @param {string} topic 
 * @param {string} difficulty 
 * @param {string} studentId 
 * @returns {Promise<{ studentId: string, sessionId: string, role: string, topic: string, difficulty: string, questions: Array<{ q: string, studentAnswer: string, feedback: any, score: number|null }> }>}
 */
export async function generateInterviewQuestions(role = "Cloud & DevOps Engineer", topic = "Docker & Containerization", difficulty = "Mid-level", studentId = "stu_c9842a1") {
  // --- Target AWS Bedrock Code Pattern ---
  /*
  const SYSTEM_PROMPT = INTERVIEW_GENERATE_PROMPT;
  const userPrompt = `Role: ${role}, Topic: ${topic}, Difficulty: ${difficulty}`;
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    })
  }));
  const rawText = new TextDecoder().decode(response.body);
  const parsedData = parseAIJsonResponse(rawText);
  if (parsedData.error) {
    console.error("Bedrock question generation error:", parsedData.error);
  }
  */

  let questionsList = [];
  try {
    if (QUESTION_BANK[role] && QUESTION_BANK[role][topic] && QUESTION_BANK[role][topic][difficulty]) {
      questionsList = QUESTION_BANK[role][topic][difficulty];
    } else {
      // Find closest or fallback
      questionsList = DEFAULT_QUESTIONS.map((q, i) => `${q} (Focus area: ${topic})`);
    }
  } catch {
    questionsList = DEFAULT_QUESTIONS;
  }

  const sessionId = "int_" + Math.random().toString(36).substring(2, 9);

  const session = {
    studentId,
    sessionId,
    role,
    topic,
    difficulty,
    questions: questionsList.map((q) => ({
      q,
      studentAnswer: "",
      feedback: null,
      score: null
    }))
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(session);
    }, 400);
  });
}

/**
 * Evaluate a student's answer to an interview question
 * Generates realistic rubric scoring: score /10, what was good, what to improve, model answer
 * 
 * @param {string} question 
 * @param {string} answer 
 * @param {string} role 
 * @param {string} topic 
 * @param {string} difficulty 
 * @returns {Promise<{ score: number, whatWasGood: string, whatToImprove: string, modelAnswer: string }>}
 */
export async function getInterviewFeedback(question, answer, role = "Cloud Engineer", topic = "DevOps", difficulty = "Mid-level") {
  // --- Target AWS Bedrock Code Pattern ---
  /*
  const SYSTEM_PROMPT = INTERVIEW_FEEDBACK_PROMPT;
  const userPrompt = `Question: "${question}"\nCandidate Answer: "${answer}"\nRole: "${role}", Topic: "${topic}", Level: "${difficulty}"`;
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    })
  }));
  const rawText = new TextDecoder().decode(response.body);
  const parsedData = parseAIJsonResponse(rawText);
  if (parsedData.error) {
    console.error("Bedrock feedback evaluation error:", parsedData.error);
  }
  */

  const trimmed = (answer || "").trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

  return new Promise((resolve) => {
    setTimeout(() => {
      if (wordCount < 10) {
        resolve({
          score: 3.5,
          whatWasGood: "You made an initial attempt to address the question prompt.",
          whatToImprove: "The answer is very brief. In technical interviews, provide concrete architectural rationale, mention key mechanisms, and cite practical trade-offs.",
          modelAnswer: `A comprehensive answer should define the fundamental concept, outline the core mechanism (e.g. how the OS or cloud control plane manages it), and discuss edge cases like error handling, security, or latency considerations.`
        });
      } else if (wordCount < 35) {
        resolve({
          score: 6.8,
          whatWasGood: "Good grasp of the high-level concept and direct response without unnecessary fluff.",
          whatToImprove: "Consider mentioning real-world operational challenges (e.g., monitoring metrics, failure recovery, or production scale constraints) to demonstrate seniority.",
          modelAnswer: `In production environments, we approach this by decoupling the components, enforcing least-privilege IAM permissions, and introducing automated health checks. For example, when configuring containerized workloads, we rely on immutable image tagging and graceful SIGTERM handling to guarantee zero dropped in-flight requests.`
        });
      } else {
        resolve({
          score: 9.0,
          whatWasGood: "Outstanding technical depth! You structured your answer clearly, used accurate industry terminology, and clearly highlighted practical trade-offs.",
          whatToImprove: "To make it flawless, briefly state how you would monitor or verify this in production using telemetry metrics (e.g., CloudWatch latency percentiles or Prometheus alerts).",
          modelAnswer: `An ideal response clearly explains: 1) The core technical abstraction and root cause, 2) The architectural pattern or tool used to resolve it, 3) Real-world operational considerations such as cost, security boundaries, and telemetry logging.`
        });
      }
    }, 600);
  });
}
