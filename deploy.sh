#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Run npm install in the root folder
echo "Running npm install in the root folder..."
npm install

# Run npm install in the tech-challenge-ui folder
echo "Running npm install in ./src/front-end/tech-challenge-ui folder..."
cd ./src/front-end/tech-challenge-ui
npm install

# Run npm run build in the tech-challenge-ui folder
echo "Running npm run build in ./src/front-end/tech-challenge-ui folder..."
npm run build

# Go back to the root folder
cd ../../..

# Deploy with CDK
echo "Deploying with CDK..."
cdk deploy --all --require-approval never

echo "Deployment complete!"
