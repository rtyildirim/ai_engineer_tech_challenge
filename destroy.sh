#!/bin/bash

# Destroy all resources with CDK
echo "Destroying resources with CDK..."
cdk destroy --all --require-approval never

echo "CDK Destroy complete!"
