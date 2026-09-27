/**
 * AWS Lambda Handler: getSkillGaps
 * 
 * Invoked by API Gateway: GET /skills?studentId=stu_c9842a1
 * 
 * Returns: Array<Skill: { studentId, skillName, currentLevel, targetLevel, status }>
 */

const { ddbDocClient, QueryCommand } = require("./awsClients");

exports.handler = async (event, context) => {
  try {
    const studentId = (event.queryStringParameters && event.queryStringParameters.studentId) || "stu_c9842a1";

    // Attempt live DynamoDB Query
    if (ddbDocClient && QueryCommand) {
      try {
        const command = new QueryCommand({
          TableName: process.env.DYNAMODB_SKILLS_TABLE || "CampusAid_Skills",
          KeyConditionExpression: "studentId = :sid",
          ExpressionAttributeValues: { ":sid": studentId }
        });
        const ddbResponse = await ddbDocClient.send(command);
        if (ddbResponse && Array.isArray(ddbResponse.Items) && ddbResponse.Items.length > 0) {
          return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify(ddbResponse.Items)
          };
        }
      } catch (ddbErr) {
        console.warn("Live DynamoDB skills query unavailable, falling back to mock:", ddbErr.message);
      }
    }

    const mockSkills = [
      { studentId, skillName: "Python", currentLevel: 4, targetLevel: 5, status: "in-progress" },
      { studentId, skillName: "Linux & Bash", currentLevel: 4, targetLevel: 4, status: "mastered" },
      { studentId, skillName: "AWS Cloud Core", currentLevel: 3, targetLevel: 5, status: "in-progress" },
      { studentId, skillName: "Docker", currentLevel: 2, targetLevel: 4, status: "needs-focus" },
      { studentId, skillName: "Terraform (IaC)", currentLevel: 1, targetLevel: 4, status: "needs-focus" },
      { studentId, skillName: "Kubernetes (K8s)", currentLevel: 1, targetLevel: 4, status: "not-started" },
      { studentId, skillName: "CI/CD Pipelines", currentLevel: 3, targetLevel: 4, status: "in-progress" }
    ];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify(mockSkills)
    };
  } catch (error) {
    console.error("Error in getSkillGaps handler:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error", message: error.message })
    };
  }
};
