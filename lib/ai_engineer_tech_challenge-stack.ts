import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';


export class AiEngineerTechChallengeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bedrockModelId = 'anthropic.claude-3-haiku-20240307-v1:0'; //'meta.llama3-1-405b-instruct-v1:0';

    // Lambda function to handle inference and return responses
    const inferenceLambda = new lambda.Function(this, 'InferenceFunction', {
      runtime: lambda.Runtime.PYTHON_3_9, // Use Python 3.9
      handler: 'inference_handler.lambda_handler',
      code: lambda.Code.fromAsset('src/lambda'),
      timeout: cdk.Duration.seconds(60),
      environment: {
        BEDROCK_MODEL_ID: bedrockModelId,
      },
    });

    // Create policy to allow access to Amazon Bedrock from lambda
    const bedrockPolicy = new iam.PolicyStatement({
      actions: [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
      ],
      resources: ["*"], // TODO: restrict to specific resources
    });

    inferenceLambda.addToRolePolicy(bedrockPolicy);

    //  API Gateway to manage API request-respansoes
    const api = new apigateway.RestApi(this, 'EngineeringChallengeAPI', {});

    // Define /infer POST endpoint to handle requests
    const inferResource = api.root.addResource('infer');
    inferResource.addMethod('POST', new apigateway.LambdaIntegration(inferenceLambda));

    // Output API Gateway url
    new cdk.CfnOutput(this, 'APIGatewayURL', {
      value: api.url,
    });

  }
}
