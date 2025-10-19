import boto3
import json

# Create a Bedrock client
bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-west-1")

# Choose a model — from your list, for example Claude Sonnet 4
model_id = "anthropic.claude-sonnet-4-20250514-v1:0"

# Define your prompt
prompt = "Write a haiku about artificial intelligence."

# Invoke the model
response = bedrock.invoke_model(
    modelId=model_id,
    body=json.dumps({
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 200
    })
)

# Parse and print the model's text output
output = json.loads(response["body"].read())
print("\nAI Response:")
print(output["content"][0]["text"])
