/**
 * CampusAid AWS Cloud Service Bridge
 * Connects frontend directly to live Amazon API Gateway, AWS Lambda, Amazon Bedrock, and DynamoDB.
 */

export const AWS_API_ENDPOINT = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AWS_API_URL) 
  ? import.meta.env.VITE_AWS_API_URL 
  : "https://2feoqqz7za.execute-api.us-east-1.amazonaws.com/default/CampusAid-API";

/**
 * Universal caller for AWS Serverless Backend
 */
export async function callAwsApi(action, payload = {}) {
  try {
    const response = await fetch(AWS_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        action,
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`AWS API HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn(`[AWS Backend] Fallback triggered for action '${action}':`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Live AWS Bedrock Study Assistant Answer
 */
export async function getAwsStudyAnswer(question, context = "", studentId = "stu_default") {
  return await callAwsApi("study/answer", { question, context, studentId });
}

/**
 * Live AWS Bedrock Career Roadmap Generator
 */
export async function generateAwsRoadmap(year, branch, goal, studentId = "stu_default") {
  return await callAwsApi("roadmap/generate", { year, branch, goal, studentId });
}

/**
 * Live AWS Bedrock ATS Resume Matcher
 */
export async function matchAwsResume(resumeText, jobDescription, targetRole) {
  return await callAwsApi("resume/match", { resumeText, jobDescription, targetRole });
}

/**
 * Live AWS Bedrock Interview Coach Feedback
 */
export async function getAwsInterviewFeedback(question, answer, role) {
  return await callAwsApi("interview/feedback", { question, answer, role });
}

/**
 * Live AWS Bedrock Cloud Code Execution / Simulation Engine
 */
export async function executeAwsCode(code, language = "python") {
  return await callAwsApi("code/execute", { code, language });
}

/**
 * Live AWS Backend Health Check
 */
export async function checkAwsBackendHealth() {
  try {
    const res = await fetch(AWS_API_ENDPOINT, { method: "GET" });
    if (!res.ok) return { healthy: false };
    const json = await res.json();
    return { healthy: true, ...json };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}
