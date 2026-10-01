const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: "us-east-1" });

async function main() {
  try {
    const payload = {
      messages: [
        { role: "user", content: [{ text: "Explain binary search in 2 sentences." }] }
      ],
      inferenceConfig: {
        max_new_tokens: 150,
        temperature: 0.7
      }
    };

    const command = new InvokeModelCommand({
      modelId: "amazon.nova-micro-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload)
    });

    console.log("Invoking Amazon Nova Micro on AWS Bedrock...");
    const response = await client.send(command);
    const json = JSON.parse(new TextDecoder().decode(response.body));
    console.log("\n=== AWS BEDROCK SUCCESS ===");
    console.log("Bedrock Response:", json.output.message.content[0].text);
  } catch (err) {
    console.error("Error invoking Bedrock:", err.message);
  }
}

main();
