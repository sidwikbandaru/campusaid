/**
 * CampusAid - Google Gemini API Integration Service
 * 
 * Provides real-time Generative AI capabilities for:
 * 1. Academic Study Assistant (dynamic explanation, examples, key points)
 * 2. Mock Interview Questions & Rubric Answer Scoring
 * 3. Career Counselor mentorship & guidance
 */

// Production model: Google Gemini 3.8 Flash
const GEMINI_MODEL = 'gemini-3.8-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Get active Gemini API Key from environment (.env or Amplify environment variables)
 */
export function getGeminiApiKey() {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return envKey.trim();
  }
  return '';
}

/**
 * Check if Gemini is configured
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
    throw new Error('Gemini API key is not configured in environment.');
  }

  const endpoint = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
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
    throw new Error('Empty response received from Gemini API');
  }

  return textOutput;
}

/**
 * Generate Study Assistant Answer using Gemini
 */
export async function generateGeminiStudyAnswer(question, studentProfile = {}) {
  const systemInstruction = `You are CampusAid's Elite Academic AI Mentor. 
Answer any user query accurately and directly.

You MUST respond strictly with a valid JSON object matching this schema (do NOT wrap with markdown backticks if possible, just raw JSON):
{
  "topic": "Concise, accurate title for this question or topic",
  "explanation": "Clear, direct, factual, and informative answer explaining the topic in 3-5 sentences.",
  "example": "A real-world example, practical application, or concrete illustration demonstrating this concept.",
  "keyPoints": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ]
}`;

  const prompt = `User Question: "${question}"
Context: Year: ${studentProfile.year || 'College'}, Major: ${studentProfile.branch || 'Computer Science'}.

Provide a real, highly accurate, and helpful response.`;

  try {
    const rawText = await callGemini(prompt, systemInstruction);
    const cleanJsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJsonText);
    return {
      topic: parsed.topic || question,
      explanation: parsed.explanation || rawText,
      example: parsed.example || 'Relevant real-world context provided above.',
      keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0 
        ? parsed.keyPoints 
        : ['Factual and reliable.', 'Essential core takeaway.', 'Practical application.']
    };
  } catch (err) {
    // If JSON parsing failed, still extract raw factual text
    try {
      const fallbackText = await callGemini(`Answer the following question accurately in 3 paragraphs: "${question}"`);
      return {
        topic: question,
        explanation: fallbackText,
        example: 'Direct AI Response from Google Gemini.',
        keyPoints: ['Accurate AI answer', 'Generated dynamically', 'Real-time response']
      };
    } catch (innerErr) {
      throw err;
    }
  }
}

/**
 * Generate Dynamic Mock Interview Questions with Gemini
 */
export async function generateGeminiInterviewQuestions(role, topic, difficulty, count = 5) {
  const systemInstruction = `You are a Principal Technical Interviewer.
Generate ${count} distinct, realistic, practical interview questions tailored for the specified role, topic, and difficulty.

Return ONLY a valid JSON array of strings containing the questions:
[
  "Question 1...",
  "Question 2...",
  "Question 3...",
  "Question 4...",
  "Question 5..."
]`;

  const prompt = `Role: ${role}\nTopic: ${topic}\nDifficulty: ${difficulty}\n\nGenerate ${count} real interview questions.`;

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
  throw new Error('Invalid question format from AI');
}

/**
 * Grade Interview Answer with Gemini
 */
export async function getGeminiInterviewFeedback(question, studentAnswer, role, topic, difficulty) {
  const systemInstruction = `You are an expert technical interviewer evaluating a student's answer.
Evaluate the answer accurately based on technical correctness, clarity, and depth.

Return ONLY a valid JSON object in this schema:
{
  "score": 8.5,
  "whatWasGood": "Accurate assessment of strengths.",
  "whatToImprove": "Constructive suggestions on missing nuances or edge cases.",
  "modelAnswer": "A comprehensive, high-scoring model answer."
}`;

  const prompt = `Role: ${role}
Topic: ${topic}
Difficulty: ${difficulty}
Question: "${question}"
Candidate Answer: "${studentAnswer || '(No answer)'}"

Evaluate the answer.`;

  const rawText = await callGemini(prompt, systemInstruction);
  const cleanJsonText = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleanJsonText);
  return {
    score: typeof parsed.score === 'number' ? Math.min(10, Math.max(0, parsed.score)) : 7.0,
    whatWasGood: parsed.whatWasGood || 'Good attempt addressing the question.',
    whatToImprove: parsed.whatToImprove || 'Add more concrete technical details.',
    modelAnswer: parsed.modelAnswer || 'A strong answer covers core principles, lifecycle, and operational trade-offs.'
  };
}

/**
 * Generate Dynamic Career Counseling with Gemini
 */
export async function generateGeminiCareerAdvice(query, studentProfile = {}) {
  const systemInstruction = `You are an experienced Tech Career Counselor and Engineering Mentor.
Provide direct, highly practical, realistic advice for the student's question.

Return ONLY a valid JSON object in this schema:
{
  "title": "Clear Action-Oriented Title",
  "advice": "Direct, insightful, and practical advice answering their specific query (3-5 sentences).",
  "actionItems": [
    "Action item 1",
    "Action item 2",
    "Action item 3",
    "Action item 4"
  ],
  "resources": [
    "Resource 1",
    "Resource 2",
    "Resource 3"
  ]
}`;

  const prompt = `Student Profile:
- Major: ${studentProfile.branch || 'Computer Science'}
- Year: ${studentProfile.year || 'Undergraduate'}
- Goal: ${studentProfile.careerGoal || 'Software Engineer'}
- Question / Situation: "${query}"

Provide tailored, realistic advice.`;

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
    actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : ['Plan milestones.', 'Build practical projects.', 'Network with professionals.'],
    resources: Array.isArray(parsed.resources) ? parsed.resources : ['GitHub', 'LeetCode', 'Roadmap.sh']
  };
}
