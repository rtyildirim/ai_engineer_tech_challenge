import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface AiEngineerTechChallengeUIStackProps extends cdk.StackProps {
  ssmParamName: string;
}

export class AiEngineerTechChallengeUIStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: AiEngineerTechChallengeUIStackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, 'TechChallengeUiBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true, // Allow public read access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Allow public access while blocking public ACLs
    });

    // Create CloudFront distribution to serve the React app from the S3 bucket
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'TechChallengeUiDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });

    // Fetch API URL from SSM
    const apiUrl = ssm.StringParameter.fromStringParameterAttributes(this, 'ApiUrl', {
      parameterName: props!.ssmParamName,
    }).stringValue;

    // Deploy the React app to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployTechChallengeUi', {
      sources: [
        s3deploy.Source.asset('./src/front-end/tech-challenge-ui/build'),
        s3deploy.Source.data('config.json', `{\n  "REACT_APP_API_URL": "${apiUrl}"\n}`)
      ],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'], // Invalidate CloudFront cache after deployment
    });

    // Output the CloudFront distribution URL
    new cdk.CfnOutput(this, 'TechChallengeUiUrl', {
      value: distribution.distributionDomainName,
      description: 'The URL of the Tech Challenge Front-End app hosted on CloudFront',
    });
  }
}
