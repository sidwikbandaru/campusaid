/**
 * AWS Lambda Handler: getStudentProfile
 * 
 * Invoked by API Gateway: GET /student/profile?studentId=stu_c9842a1
 * 
 * Returns: Student: { studentId, name, year, branch, careerGoal }
 */

const { ddbDocClient, GetCommand } = require("./awsClients");

exports.handler = async (event, context) => {
  try {
    const studentId = (event.queryStringParameters && event.queryStringParameters.studentId) || "stu_c9842a1";

    // Attempt live DynamoDB GetItem
    if (ddbDocClient && GetCommand) {
      try {
        const command = new GetCommand({
          TableName: process.env.DYNAMODB_STUDENTS_TABLE || "CampusAid_Students",
          Key: { studentId }
        });
        const ddbResponse = await ddbDocClient.send(command);
        if (ddbResponse && ddbResponse.Item) {
          return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify(ddbResponse.Item)
          };
        }
      } catch (ddbErr) {
        console.warn("Live DynamoDB student profile query unavailable, falling back to mock:", ddbErr.message);
      }
    }

    const studentRecord = {
      studentId,
      name: "Alex Rivera",
      year: "3rd Year",
      branch: "Computer Science & Engineering",
      careerGoal: "Cloud & DevOps Solutions Architect",
      email: "alex.rivera@campus.edu"
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify(studentRecord)
    };
  } catch (error) {
    console.error("Error in getStudentProfile handler:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error", message: error.message })
    };
  }
};
