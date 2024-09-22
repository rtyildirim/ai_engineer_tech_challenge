#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AiEngineerTechChallengeAPIStack } from '../lib/ai_engineer_tech_challenge-api-stack';
import { AiEngineerTechChallengeUIStack } from '../lib/ai_engineer_tech_challenge-ui-stack';

const app = new cdk.App();
const apiStack =new AiEngineerTechChallengeAPIStack(app, 'AiEngineerTechChallengeAPIStack', {});
const uiSTack = new AiEngineerTechChallengeUIStack(app, 'AiEngineerTechChallengeUIStack', {
  ssmParamName: apiStack.ssmParamName,
});