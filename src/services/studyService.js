/**
 * CampusAid AI - Study Assistant Service
 * 
 * Target AWS Integration:
 * - Amazon Bedrock: anthropic.claude-3-sonnet-20240229-v1:0 or amazon.titan-text-express-v1
 * - DynamoDB Table: CampusAid_StudySessions (Partition Key: studentId, Sort Key: sessionId)
 * 
 * Replace mock with:
 * const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
 * const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
 */

// System prompt for Study Assistant
export const SYSTEM_PROMPT = `You are CampusAid's Study Assistant for a college student.
Given a question (and optional uploaded document text), respond with:
1. A simple explanation (plain language, 3-5 sentences)
2. One concrete example
3. 3 key points as a short list
If document context is provided, ground your answer in it and say so.
If the question is broad, explain only the most essential concept in scope —
don't try to cover every sub-topic.
Keep the total response under 250 words unless asked for more detail.`;

export const STUDY_AI_PROMPT = SYSTEM_PROMPT;

// Clean parenthetical/bracketed notes from questions
export function cleanQuestion(question) {
  if (!question || typeof question !== 'string') return '';
  return question
    .replace(/\s*(\([^)]*\)|\[[^\]]*\])\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Realistic mock responses lookup for common study topics
const STUDY_LOOKUP = [
  {
    matcher: (q) => q.includes('recursion'),
    answer: {
      topic: 'Recursion',
      explanation: 'Recursion is a programming technique where a function solves a problem by calling a smaller instance of itself until it reaches a defined stopping condition known as the base case. Each recursive invocation adds an activation frame to the system call stack, storing its own distinct arguments and local state. Once the base case is satisfied, the pending calls resolve in reverse order, passing computed values back up the chain of execution. This structure naturally decomposes complex, self-similar problems into concise and elegant logic.',
      example: 'Calculating factorial of 4 (4!): The function computes 4 × factorial(3), which calls 3 × factorial(2), down to the base case of factorial(1) = 1. The stack then unwinds to compute 1 × 2 = 2, 2 × 3 = 6, and finally 6 × 4 = 24.',
      keyPoints: [
        'A base case is mandatory to prevent infinite execution and stack overflow errors.',
        'Each recursive call consumes additional memory on the call stack proportional to recursion depth.',
        'Well-suited for hierarchical data structures like trees and divide-and-conquer algorithms like Merge Sort.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('page replacement') || /\bos\b/.test(q) || q.includes('operating system'),
    answer: {
      topic: 'Page Replacement Algorithms',
      explanation: 'Page replacement algorithms are used by an operating system\'s virtual memory manager when a page fault occurs and all physical memory frames in RAM are occupied. The OS must select an existing resident page to swap out to secondary disk storage to allocate space for the incoming page. The core objective is minimizing page fault frequency to prevent thrashing, where the CPU spends more time swapping data than running processes. Common strategies include First-In-First-Out (FIFO), Least Recently Used (LRU), and Optimal page replacement.',
      example: 'In a FIFO page replacement system with 3 physical frames, loading page requests 1, 2, 3, and then 4 results in evicting page 1 because it has resided in physical memory the longest.',
      keyPoints: [
        'Allows programs requiring more memory than available physical RAM to execute reliably.',
        'Algorithms like LRU use past access history to estimate future page access probability.',
        'Suboptimal replacement choices cause memory thrashing, drastically reducing overall system throughput.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('normalization') || /\bdbms\b/.test(q) || q.includes('database'),
    answer: {
      topic: 'Database Normalization',
      explanation: 'Database normalization is the systematic technique of organizing fields and tables within a relational database to minimize data redundancy and eliminate anomalies. It involves decomposing large, unfocused tables into smaller, well-structured relationships connected via foreign keys. The process progresses through formal stages known as normal forms (such as 1NF, 2NF, 3NF, and BCNF), with each step enforcing tighter constraints on functional dependencies. Normalizing data prevents duplicate records and guarantees consistent modifications across the database.',
      example: 'Instead of repeating a student\'s department name and department head in every course enrollment row, store department information in a separate Departments table and link it with a foreign key DepartmentID.',
      keyPoints: [
        'Reduces redundant data footprint and ensures strict relational integrity across tables.',
        'Eliminates update, insertion, and deletion anomalies that can silently corrupt data.',
        'Higher normal forms may require multiple table JOINs, which can introduce read latency tradeoffs.'
      ]
    }
  }
];

// Fallback structured study response for any other question
const FALLBACK_STUDY_ANSWER = {
  topic: 'Concept Analysis',
  explanation: 'In computer science and software systems, this concept defines fundamental operational rules that govern how data is structured and processed. It establishes clear modular boundaries and standardized conventions that make system behavior predictable, testable, and easier to maintain. Understanding its underlying mechanics allows engineers to choose optimal data structures and write clean, resilient code.',
  example: 'A concrete application is designing clear service contracts between modules, ensuring changes to internal implementation details do not disrupt upstream or downstream consumers.',
  keyPoints: [
    'Establishes explicit architectural boundaries and predictable execution behavior.',
    'Helps developers analyze performance trade-offs between execution speed and resource consumption.',
    'Follows standard design patterns that simplify ongoing debugging, testing, and maintenance.'
  ]
};

/**
 * Get study answer for a student's question
 * Mimics AWS Bedrock Claude 3 / Titan prompt invocation + DynamoDB session logging
 * 
 * @param {string} question - Question submitted by student
 * @param {string} studentId - Student identifier
 * @returns {Promise<{ studentId: string, sessionId: string, question: string, answer: { topic?: string, explanation: string, example: string, keyPoints: string[] } }>}
 */
export async function getStudyAnswer(question, studentId = "stu_c9842a1") {
  const cleanedQuestion = cleanQuestion(question);

  // --- Target AWS Bedrock Code Pattern ---
  /*
  const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: cleanedQuestion }]
    })
  }));
  const result = JSON.parse(new TextDecoder().decode(response.body));
  const parsedAnswer = result.content[0].text;
  */

  // Realistic mock generation matching topic lookup
  const lowerQ = cleanedQuestion.toLowerCase();
  let matchedAnswer = FALLBACK_STUDY_ANSWER;

  for (const item of STUDY_LOOKUP) {
    if (item.matcher(lowerQ)) {
      matchedAnswer = item.answer;
      break;
    }
  }

  const sessionId = "sess_" + Math.random().toString(36).substring(2, 9);

  const sessionRecord = {
    studentId,
    sessionId,
    question: cleanedQuestion,
    answer: matchedAnswer,
    timestamp: new Date().toISOString()
  };

  // Simulate network roundtrip latency typical of Bedrock LLM streaming
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sessionRecord);
    }, 400);
  });
}

