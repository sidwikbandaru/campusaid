/**
 * CampusAid - Google Gemini API Integration Service
 * 
 * Provides real-time Generative AI capabilities for:
 * 1. Academic Study Assistant (dynamic explanation, examples, key points)
 * 2. Mock Interview Questions & Rubric Answer Scoring
 * 3. Career Counselor mentorship & guidance
 * 
 * Includes graceful fallback to internal heuristic engines if API key is not configured
 * or network is offline.
 */

const STORAGE_GEMINI_KEY = 'campusaid_gemini_api_key';

// Default model to use (Gemini 2.5 Flash / 1.5 Flash for high-speed, cost-free generation)
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Get active Gemini API Key from environment or localStorage
 */
export function getGeminiApiKey() {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return envKey.trim();
  }
  return localStorage.getItem(STORAGE_GEMINI_KEY) || '';
}

/**
 * Save Gemini API Key to localStorage for seamless client-side use
 */
export function setGeminiApiKey(key) {
  if (!key) {
    localStorage.removeItem(STORAGE_GEMINI_KEY);
  } else {
    localStorage.setItem(STORAGE_GEMINI_KEY, key.trim());
  }
}

/**
 * Check if Gemini is configured and ready
 */
export function isGeminiActive() {
  return Boolean(getGeminiApiKey());
}

/**
 * Direct call to Gemini API
 */
async function callGemini(prompt, systemInstruction = '') {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const endpoint = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Gemini API Error (${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Empty response from Gemini API');
  }

  return textOutput;
}

/**
 * Generate Study Assistant Answer using Gemini
 */
export async function generateGeminiStudyAnswer(question, studentProfile = {}) {
  const systemInstruction = `You are CampusAid's Elite Academic AI Mentor for college engineering students.
Your goal is to answer academic, algorithmic, or software engineering questions clearly, accurately, and comprehensively.

CRITICAL INSTRUCTION: You MUST return your response as a valid JSON object ONLY, with no extra text or markdown code fences, in this exact format:
{
  "topic": "Concise Formal Title of the Topic",
  "explanation": "Clear, plain-language conceptual breakdown explaining the core mechanisms (3-5 sentences).",
  "example": "A concrete, real-world engineering or coding scenario demonstrating how this works in production or practical code.",
  "keyPoints": [
    "Key takeaway point 1 (high-yield exam/interview fact)",
    "Key takeaway point 2 (performance, complexity, or edge case)",
    "Key takeaway point 3 (best practice or architecture rule)"
  ]
}`;

  const prompt = `Student Question: "${question}"
Student Background: Year: ${studentProfile.year || 'College'}, Major: ${studentProfile.branch || 'Computer Science'}, Career Goal: ${studentProfile.careerGoal || 'Software Engineer'}.

Explain this topic thoroughly following the JSON schema.`;

  try {
    const rawText = await callGemini(prompt, systemInstruction);
    // Sanitize JSON
    const cleanJsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJsonText);
    return {
      topic: parsed.topic || question,
      explanation: parsed.explanation || rawText,
      example: parsed.example || 'Example provided above.',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : ['Review core principles.', 'Analyze complexity trade-offs.', 'Practice hands-on implementation.'],
      poweredBy: 'Google Gemini AI'
    };
  } catch (err) {
    console.warn('[Gemini Study Service Error]', err.message);
    throw err;
  }
}

/**
 * Generate Dynamic Mock Interview Questions with Gemini
 */
export async function generateGeminiInterviewQuestions(role, topic, difficulty, count = 5) {
  const systemInstruction = `You are a Principal Tech Interviewer at a top technology company.
Generate ${count} distinct, rigorous, practical interview questions tailored for the specified role, topic, and difficulty level.

CRITICAL: Return ONLY a valid JSON array of strings containing the questions, like:
[
  "Question 1...",
  "Question 2...",
  "Question 3...",
  "Question 4...",
  "Question 5..."
]`;

  const prompt = `Role: ${role}
Topic: ${topic}
Difficulty: ${difficulty}

Generate ${count} realistic technical interview questions testing real-world engineering knowledge, architecture, code quality, and debugging.`;

  try {
    const rawText = await callGemini(prompt, systemInstruction);
    const cleanJsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJsonText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, count);
    }
    throw new Error('Invalid question format returned');
  } catch (err) {
    console.warn('[Gemini Interview Questions Error]', err.message);
    throw err;
  }
}

/**
 * Grade Interview Answer with Gemini
 */
export async function getGeminiInterviewFeedback(question, studentAnswer, role, topic, difficulty) {
  const systemInstruction = `You are an expert technical interviewer evaluating a student's answer.
Grade the candidate objectively on technical accuracy, depth, industry best practices, and communication clarity.

CRITICAL: Return ONLY a valid JSON object in this exact schema:
{
  "score": 8.5,
  "whatWasGood": "Specific praise on what concepts the candidate correctly identified and explained.",
  "whatToImprove": "Constructive, actionable feedback on what technical nuances, edge cases, or production considerations were missed.",
  "modelAnswer": "A comprehensive, high-scoring (10/10) model answer that demonstrates senior-level knowledge."
}

Note: "score" must be a number between 0.0 and 10.0 (e.g. 7.5).`;

  const prompt = `Interview Context:
- Role: ${role}
- Topic: ${topic}
- Difficulty: ${difficulty}
- Question: "${question}"
- Candidate Answer: "${studentAnswer || '(No answer provided)'}"

Evaluate this answer and provide rubric scoring and model answer.`;

  try {
    const rawText = await callGemini(prompt, systemInstruction);
    const cleanJsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJsonText);
    return {
      score: typeof parsed.score === 'number' ? Math.min(10, Math.max(0, parsed.score)) : 7.0,
      whatWasGood: parsed.whatWasGood || 'Good effort addressing the core concepts.',
      whatToImprove: parsed.whatToImprove || 'Consider adding more concrete implementation details and system trade-offs.',
      modelAnswer: parsed.modelAnswer || 'A strong answer clearly explains the mechanism, lifecycle, and operational trade-offs.',
      poweredBy: 'Google Gemini AI'
    };
  } catch (err) {
    console.warn('[Gemini Interview Grading Error]', err.message);
    throw err;
  }
}

/**
 * Generate Dynamic Career Counseling with Gemini
 */
export async function generateGeminiCareerAdvice(query, studentProfile = {}) {
  const systemInstruction = `You are a Senior Career Mentor & Engineering Director guiding a college student.
Provide compassionate, highly actionable, strategic career advice.

CRITICAL: Return ONLY a valid JSON object in this exact schema:
{
  "title": "Inspiring & Direct Action Title",
  "advice": "Clear, direct guidance explaining the optimal strategy, market realities, and mindset (3-5 sentences).",
  "actionItems": [
    "Concrete actionable step 1",
    "Concrete actionable step 2",
    "Concrete actionable step 3",
    "Concrete actionable step 4"
  ],
  "resources": [
    "Resource or tool recommendation 1",
    "Resource or tool recommendation 2",
    "Resource or tool recommendation 3"
  ]
}`;

  const prompt = `Student Profile:
- Current Major: ${studentProfile.branch || 'Computer Science'}
- Year of Study: ${studentProfile.year || 'Undergraduate'}
- Target Career Goal: ${studentProfile.careerGoal || 'Software Engineer'}
- Student Question / Dilemma: "${query}"

Provide tailored, strategic mentorship advice.`;

  try {
    const rawText = await callGemini(prompt, systemInstruction);
    const cleanJsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJsonText);
    return {
      title: parsed.title || 'Personalized Career Guidance',
      advice: parsed.advice || rawText,
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : ['Build portfolio projects.', 'Practice DSA fundamentals.', 'Network on LinkedIn.'],
      resources: Array.isArray(parsed.resources) ? parsed.resources : ['GitHub', 'LeetCode', 'Roadmap.sh'],
      poweredBy: 'Google Gemini AI'
    };
  } catch (err) {
    console.warn('[Gemini Career Advice Error]', err.message);
    throw err;
  }
}
