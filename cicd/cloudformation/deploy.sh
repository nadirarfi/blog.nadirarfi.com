#!/bin/bash
set -e


# Default values
TEMPLATE_FILE="github-oidc.cfn.yaml"
STACK_NAME="github-actions-oidc"
REPO_NAME="blog.nadirarfi.com"
BRANCH_NAME="main"
ROLE_NAME="GitHubActionsRole"
USE_EXISTING="no"

# Arguments
AWS_PROFILE=""
GITHUB_ORG=""

# Get GitHub organization (required)
if [ -z "$1" ]; then
  echo "Error: GitHub organization/username is required"
  echo "Usage: $0 <github-org> [aws-profile]"
  exit 1
else
  GITHUB_ORG="$1"
fi

# Get AWS profile if provided
if [ -n "$2" ]; then
  AWS_PROFILE="$2"
fi

echo "Deploying with:"
echo "- GitHub Organization: $GITHUB_ORG"
echo "- AWS Profile: $AWS_PROFILE"

# Deploy CloudFormation stack
aws cloudformation deploy \
  --profile "$AWS_PROFILE" \
  --template-file "$TEMPLATE_FILE" \
  --stack-name "$STACK_NAME" \
  --parameter-overrides \
        GitHubOrganization="$GITHUB_ORG" \
        RepositoryName="$REPO_NAME" \
        BranchName="$BRANCH_NAME" \
        RoleName="$ROLE_NAME" \
        UseExistingProvider="$USE_EXISTING" \
  --capabilities CAPABILITY_NAMED_IAM

# Get the IAM role ARN
ROLE_ARN=$(aws cloudformation describe-stacks \
  --profile "$AWS_PROFILE" \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='RoleGithubActionsARN'].OutputValue" \
  --output text)

echo "Successfully created IAM role: $ROLE_ARN"
echo "Add this as a GitHub secret named AWS_ROLE_ARN"
