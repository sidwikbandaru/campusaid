/**
 * Shared AWS SDK Clients for CampusAid Lambda Handlers
 * 
 * Safely initializes BedrockRuntimeClient and DynamoDBDocumentClient.
 * Falls back gracefully if AWS SDK is not yet installed in the current environment.
 */

let BedrockRuntimeClient = null;
let InvokeModelCommand = null;
let DynamoDBClient = null;
let DynamoDBDocumentClient = null;
let PutCommand = null;
let GetCommand = null;
let QueryCommand = null;
let UpdateCommand = null;

try {
  const bedrockPkg = require("@aws-sdk/client-bedrock-runtime");
  BedrockRuntimeClient = bedrockPkg.BedrockRuntimeClient;
  InvokeModelCommand = bedrockPkg.InvokeModelCommand;

  const ddbPkg = require("@aws-sdk/client-dynamodb");
  DynamoDBClient = ddbPkg.DynamoDBClient;

  const ddbDocPkg = require("@aws-sdk/lib-dynamodb");
  DynamoDBDocumentClient = ddbDocPkg.DynamoDBDocumentClient;
  PutCommand = ddbDocPkg.PutCommand;
  GetCommand = ddbDocPkg.GetCommand;
  QueryCommand = ddbDocPkg.QueryCommand;
  UpdateCommand = ddbDocPkg.UpdateCommand;
} catch (err) {
  // SDK not present in local dev environment; handlers will fall back to realistic mock responses
}

const region = process.env.AWS_REGION || "us-east-1";
const bedrock = BedrockRuntimeClient ? new BedrockRuntimeClient({ region }) : null;
const ddbDocClient = (DynamoDBDocumentClient && DynamoDBClient)
  ? DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
      marshallOptions: { removeUndefinedValues: true }
    })
  : null;

module.exports = {
  bedrock,
  ddbDocClient,
  InvokeModelCommand,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DEFAULT_BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0"
};
