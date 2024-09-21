import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class AiEngineerTechChallengeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function to handle inference and return responses
    const inferenceLambda = new lambda.Function(this, 'InferenceFunction', {
      runtime: lambda.Runtime.PYTHON_3_9, // Use Python 3.9
      handler: 'inference_handler.lambda_handler',
      code: lambda.Code.fromAsset('src/lambda'),
    });

    //  API Gateway to manage API request-respansoes
    const api = new apigateway.RestApi(this, 'EngineeringChallengeAPI');

    // Define /infer POST endpoint to handle requests
    const inferResource = api.root.addResource('infer');
    inferResource.addMethod('POST', new apigateway.LambdaIntegration(inferenceLambda));

    // Output API Gateway url
    new cdk.CfnOutput(this, 'APIGatewayURL', {
      value: api.url,
    });

  }
}
