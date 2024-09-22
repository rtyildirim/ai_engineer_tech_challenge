import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { CorsRule } from 'aws-cdk-lib/aws-s3';


export class AiEngineerTechChallengeAPIStack extends cdk.Stack {

  public readonly ssmParamName = 'ai-tech-challenge-api-url';

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bedrockModelId = 'anthropic.claude-3-haiku-20240307-v1:0'; //'meta.llama3-1-405b-instruct-v1:0';


    // Define the CORS rules for the S3 bucket
    const corsRule: CorsRule = {
      allowedMethods: [
        cdk.aws_s3.HttpMethods.PUT, // Allow PUT requests (for uploading files)
        cdk.aws_s3.HttpMethods.GET, // Allow GET requests (for reading files)
      ],
      allowedOrigins: ['*'],  // Allow requests from any origin
      allowedHeaders: ['*'],  // Allow all headers
    };

    // Create S3 bucket to upload files
    const fileUploadBucket = new s3.Bucket(this, 'FileUploadBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [corsRule],
    });

    // Lambda function to handle inference and return responses
    const inferenceLambda = new lambda.Function(this, 'InferenceFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'inference_handler.lambda_handler',
      code: lambda.Code.fromAsset('src/lambda'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        BEDROCK_MODEL_ID: bedrockModelId,
        BUCKET_NAME: fileUploadBucket.bucketName,
      },
    });

    // Grant S3 read and write permissions to the Lambda
    fileUploadBucket.grantReadWrite(inferenceLambda);

    // Create policy to allow access to Amazon Bedrock from lambda
    const bedrockPolicy = new iam.PolicyStatement({
      actions: [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
      ],
      resources: ["*"], // TODO: restrict to specific resources
    });

    inferenceLambda.addToRolePolicy(bedrockPolicy);

    // Create Lambda function to handle /files endpoint
    const fileHandlerLambda = new lambda.Function(this, 'FileHandlerLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'file_handler.lambda_handler',
      code: lambda.Code.fromAsset('src/lambda'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        BUCKET_NAME: fileUploadBucket.bucketName,
      },
    });

    // Grant S3 read and write permissions to the Lambda
    fileUploadBucket.grantReadWrite(fileHandlerLambda);

    //  API Gateway to manage API request-respansoes
    const api = new apigateway.RestApi(this, 'EngineeringChallengeAPI', {});

    // Define /infer POST endpoint to handle requests
    const inferResource = api.root.addResource('infer');
    inferResource.addMethod('POST', new apigateway.LambdaIntegration(inferenceLambda));

    // Define /file POST endpoint to handle requests
    const fileResource = api.root.addResource('file');
    fileResource.addMethod('POST', new apigateway.LambdaIntegration(fileHandlerLambda));

    // Output the API URL
    new cdk.CfnOutput(this, 'APIGatewayURL', {
      value: api.url,
      exportName: 'APIGatewayURL',
    });

    // Store the API Gateway URL in SSM Parameter Store
    new ssm.StringParameter(this, 'ApiGatewayUrlParameter', {
      parameterName: this.ssmParamName,
      stringValue: api.url,
      simpleName: true,
    });

  }

}
