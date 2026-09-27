/**
 * CampusAid AI - Career Roadmap Service
 * 
 * Target AWS Integration:
 * - Amazon Bedrock: Generates customized milestones based on student curriculum and career goals
 * - DynamoDB Table: CampusAid_Roadmaps (Partition Key: studentId, Sort Key: roadmapId)
 * 
 * Matches Data Structure:
 * Roadmap: { studentId, roadmapId, targetRole, phases: [{ name, items: [{ skill, done }] }] }
 */

// In-memory persistent mock state for the session
let currentRoadmap = {
  studentId: "stu_c9842a1",
  roadmapId: "rdm_cloud_2026",
  targetRole: "Cloud & DevOps Solutions Architect",
  phases: [
    {
      name: "Phase 1: Foundational Systems & Scripting",
      items: [
        { skill: "Linux OS Internals & Bash Shell Scripting", done: true },
        { skill: "Computer Networking (TCP/IP, DNS, Subnets, OSI Model)", done: true },
        { skill: "Data Structures & Algorithms in Python or Go", done: true },
        { skill: "Git Version Control, Branching & GitHub Collaboration", done: true }
      ]
    },
    {
      name: "Phase 2: Cloud Computing Core (AWS)",
      items: [
        { skill: "AWS IAM (Roles, Policies, Least-Privilege Access)", done: true },
        { skill: "VPC Architecture (Public/Private Subnets, NAT Gateways)", done: true },
        { skill: "Serverless Compute (AWS Lambda, API Gateway)", done: false },
        { skill: "Cloud Storage & Databases (Amazon S3, DynamoDB)", done: false }
      ]
    },
    {
      name: "Phase 3: Containers, CI/CD & Orchestration",
      items: [
        { skill: "Docker Engine, Multi-Stage Builds & Image Optimization", done: false },
        { skill: "Continuous Integration & Deployment (GitHub Actions, AWS CodePipeline)", done: false },
        { skill: "Kubernetes Architecture (Pods, Deployments, Services, Ingress)", done: false },
        { skill: "Infrastructure as Code with Terraform or AWS CDK", done: false }
      ]
    },
    {
      name: "Phase 4: Production Observability & High Availability",
      items: [
        { skill: "CloudWatch Metrics, Alarms & Centralized Logging", done: false },
        { skill: "Auto Scaling, Load Balancing (ALB) & Disaster Recovery", done: false },
        { skill: "Zero-Trust Security, KMS Encryption & Secrets Manager", done: false },
        { skill: "Cost Optimization & AWS Well-Architected Framework", done: false }
      ]
    }
  ]
};

// System prompt for Career Roadmap generator
export const SYSTEM_PROMPT = `You are CampusAid's Career Roadmap generator.
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

export const ROADMAP_AI_PROMPT = SYSTEM_PROMPT;

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
 * Generate or tailor a personalized roadmap based on student parameters
 * @param {string} year 
 * @param {string} branch 
 * @param {string} goal 
 * @param {string} studentId 
 * @returns {Promise<typeof currentRoadmap>}
 */
export async function generateRoadmap(year = "3rd Year", branch = "Computer Science", goal = "Cloud & DevOps Solutions Architect", studentId = "stu_c9842a1") {
  // --- Target AWS Bedrock Code Pattern ---
  /*
  const userPrompt = `Year: ${year}, Branch: ${branch}, Target Career: ${goal}`;
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    })
  }));
  const rawText = new TextDecoder().decode(response.body);
  const parsedData = parseAIJsonResponse(rawText);
  if (parsedData.error) {
    console.error("Bedrock roadmap generation error:", parsedData.error);
    return { error: parsedData.error };
  }
  // Call Bedrock -> Parse result -> Save to DynamoDB
  */

  return new Promise((resolve) => {
    setTimeout(() => {
      // If student chooses a different goal, generate relevant roadmap phases
      if (goal.toLowerCase().includes("data") || goal.toLowerCase().includes("ml") || goal.toLowerCase().includes("ai")) {
        currentRoadmap = {
          studentId,
          roadmapId: "rdm_data_ai_2026",
          targetRole: goal,
          phases: [
            {
              name: "Phase 1: Mathematics & Data Programming",
              items: [
                { skill: "Linear Algebra, Calculus & Statistics Fundamentals", done: true },
                { skill: "Python for Data Analysis (NumPy, Pandas, Vectorization)", done: true },
                { skill: "SQL Query Optimization & Relational Schema Design", done: true },
                { skill: "Data Cleaning, Transformation & Exploratory Analysis", done: false }
              ]
            },
            {
              name: "Phase 2: Machine Learning & Modeling",
              items: [
                { skill: "Supervised & Unsupervised Learning (Scikit-Learn)", done: false },
                { skill: "Deep Learning Foundations (PyTorch / TensorFlow)", done: false },
                { skill: "Feature Engineering & Model Validation Metrics", done: false }
              ]
            },
            {
              name: "Phase 3: Production MLOps & Cloud Pipelines",
              items: [
                { skill: "Data Pipelines with Apache Spark & AWS Glue", done: false },
                { skill: "Containerizing ML Models with Docker & FastAPI", done: false },
                { skill: "Model Deployment & Monitoring (AWS SageMaker, MLflow)", done: false }
              ]
            },
            {
              name: "Phase 4: Generative AI & Vector Architectures",
              items: [
                { skill: "LLM Orchestration & Prompt Engineering (LangChain/Bedrock)", done: false },
                { skill: "Retrieval-Augmented Generation (RAG) & Vector DBs (Pinecone/OpenSearch)", done: false }
              ]
            }
          ]
        };
      } else if (goal.toLowerCase().includes("fullstack") || goal.toLowerCase().includes("web")) {
        currentRoadmap = {
          studentId,
          roadmapId: "rdm_fullstack_2026",
          targetRole: goal,
          phases: [
            {
              name: "Phase 1: Modern Frontend Core",
              items: [
                { skill: "HTML5 Semantic Architecture & Modern CSS Grid/Flexbox", done: true },
                { skill: "Modern JavaScript (ES6+, Promises, Async/Await)", done: true },
                { skill: "React Fundamentals, Hooks & State Management", done: true },
                { skill: "Responsive Design & Accessibility (a11y)", done: false }
              ]
            },
            {
              name: "Phase 2: Scalable Backend Services",
              items: [
                { skill: "Node.js & Express RESTful API Architecture", done: false },
                { skill: "PostgreSQL Database Design & Prisma ORM", done: false },
                { skill: "Authentication & Authorization (JWT, OAuth2, Sessions)", done: false }
              ]
            },
            {
              name: "Phase 3: Real-Time & Cloud Deployment",
              items: [
                { skill: "WebSockets & Real-Time Event Communication", done: false },
                { skill: "Serverless Deployment with AWS Lambda & CloudFront", done: false },
                { skill: "Unit & Integration Testing (Vitest, Playwright)", done: false }
              ]
            }
          ]
        };
      } else {
        currentRoadmap.targetRole = goal;
      }
      resolve({ ...currentRoadmap });
    }, 300);
  });
}

/**
 * Toggle or update the done state of a specific skill item
 * @param {string} studentId 
 * @param {string} roadmapId 
 * @param {number} phaseIndex 
 * @param {number} itemIndex 
 * @param {boolean} done 
 * @returns {Promise<typeof currentRoadmap>}
 */
export async function updateRoadmapSkill(studentId, roadmapId, phaseIndex, itemIndex, done) {
  // Simulates DynamoDB UpdateCommand on nested phase item
  if (currentRoadmap.phases[phaseIndex] && currentRoadmap.phases[phaseIndex].items[itemIndex]) {
    currentRoadmap.phases[phaseIndex].items[itemIndex].done = done;
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...currentRoadmap });
    }, 100);
  });
}

/**
 * Get current roadmap
 * @param {string} studentId 
 */
export async function getSavedRoadmap(studentId = "stu_c9842a1") {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...currentRoadmap });
    }, 120);
  });
}
