# Skyward tech challenge for AI engineer position

# Solution Overview

This solution utilizes the following tech stack:

- **Cloud Platform**: AWS
- **Infrastructure as Code**: AWS Cloud Development Kit (CDK) using TypeScript
- **Front-end Development**: React
- **Back-end Development**: Python

The backend API is built using AWS serverless services, specifically API Gateway and Lambda. Uploaded files are stored in S3, and Amazon Bedrock is employed for model inference, utilizing the `anthropic.claude-3-haiku-20240307-v1:0` model.

The front end is developed in React and deployed to AWS CloudFront as a single-page application, benefiting from high availability and scalability provided by AWS serverless architecture.

## API

The backend API exposes the following endpoints:

- `/file` (POST): Uploads files to S3 for inference (optional). Returns the given uuid file name to be used in inference
- `/infer` (POST): Performs model inference and returns a response. The request body includes one required field and four optional fields:
  - `question` (Required)
  - `focus` (Optional)
  - `attachment` (Optional)
  - `previousQuestion` (Optional, required if `previousAnswer` is provided)
  - `previousAnswer` (Optional, required if `previousQuestion` is provided)

The API returns a JSON object, with `response_text` containing the inferred answer.

## Front-End

The front end features a simple UI that allows users to ask questions and follow up. It is deployed on CloudFront, ensuring low latency, high availability, and scalability. The front-end application queries the API for answers and supports file uploads.

## Deployment

### Requirements

- Node.js (tested with Node 18)
- AWS CDK
- Valid AWS credentials with necessary deployment permissions
- Default AWS region set (e.g., `export AWS_DEFAULT_REGION=us-east-1`)

### Deployment Steps

1. Run the deployment script:
   `./deploy.sh`
2. After deployment completes, the CDK will output the CloudFront distribution URL. Open this URL in a browser to interact with the UI.
3. Alternatively, you can test the API. The API endpoint URL (`apiURL`) will be displayed as output after deployment.
   - Send POST requests to `<apiURL>/infer` with a request body like:
   ```
   {
     "question": "What is the capital city of the USA?",
     "focus": "Web"
   }
   ```

## Destroy Created Resources

To clean up resources after use, run:
`./destroy.sh`
Note that S3 buckets will not be deleted.

---
# ORIGINAL README CONTENT

This repository is meant to be used as a challenge for AI engineer candidates at Skyward.
You should fork/clone this repository to use as a basis for the challenge. Once you are done with the challenge, send us a link to your github repository with the final solution and record a short video of the working app.

Subject of this challenge is to develop and deploy a simple, but production ready replica of [Perplexity.ai](https://www.perplexity.ai/).

The requirements are as follows:
* Feel free to use any open-source framework : LlamaIndex, LangChain, Haystack, etc.
* Basic UI.
* Any LLM.
* Any Cloud.
* Should be deployable with scripts (IaC)
* Think about scalability and performance.<br>



Helpers:

- IaC Test account:
  - AWS Free Tier account: <https://aws.amazon.com/free/>
  - Localstack API: <https://localstack.cloud>
- Terraform best practices: <https://cloud.google.com/docs/terraform/best-practices-for-terraform>
- Terraform AWS provider: <https://registry.terraform.io/providers/hashicorp/aws/latest>
- LlamaIndex: <https://www.llamaindex.ai/>
- LangChain: <https://www.langchain.com/>
- Streamlit: <https://streamlit.io/>
- Loom: <https://www.loom.com/>
