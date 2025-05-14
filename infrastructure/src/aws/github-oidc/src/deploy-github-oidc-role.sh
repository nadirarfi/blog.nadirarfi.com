#!/bin/bash
set -e

# Directory setup
# SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
# INFRASTRUCTURE_ROOT="$(cd "${SCRIPT_DIR}/../.." &> /dev/null && pwd)"
CONFIG_DIR="../../../config"
CFN_TEMPLATE_PATH="cloudformation/templates/github-oidc-iam-role.cfn.yaml"  # Updated template path
CONFIG_FILE="${CONFIG_DIR}/config.prime.yaml"

# Check if required files exist
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file not found at $CONFIG_FILE"
    exit 1
fi

if [ ! -f "$CFN_TEMPLATE_PATH" ]; then
    echo "Error: CloudFormation template not found at $CFN_TEMPLATE_PATH"
    exit 1
fi

# Check if yq is installed
if ! command -v yq &> /dev/null; then
    echo "Error: yq is not installed. Please install it first."
    echo "Install with:"
    echo "  - On macOS: brew install yq"
    echo "  - On Linux: snap install yq or wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq && chmod +x /usr/bin/yq"
    exit 1
fi

# Load configuration using yq
echo "Loading configuration from $CONFIG_FILE..."

# Get values with defaults using yq and strip quotes
AWS_PROFILE=$(yq -r '.cicd.github_oidc.aws_profile' "$CONFIG_FILE")
REGION=$(yq -r '.cicd.github_oidc.aws_region' "$CONFIG_FILE")
GITHUB_ORG=$(yq -r '.cicd.github_oidc.github_organization' "$CONFIG_FILE")
REPO_NAME=$(yq -r '.cicd.github_oidc.repository_name // "*"' "$CONFIG_FILE")
BRANCH_NAME=$(yq -r '.cicd.github_oidc.branch_name // "*"' "$CONFIG_FILE")
ROLE_NAME=$(yq -r '.cicd.github_oidc.role_name' "$CONFIG_FILE")
STACK_NAME=$(yq -r '.cicd.github_oidc.stack_name' "$CONFIG_FILE")
SSM_PROVIDER_PATH=$(yq -r '.cicd.github_oidc.oidc_provider_ssm_param' "$CONFIG_FILE")
POLICY_ARNS=$(yq -r '.cicd.github_oidc.policy_arns[]' "$CONFIG_FILE" | tr '\n' ',' | sed 's/,$//')

# Set AWS profile if not provided
if [ -z "$AWS_PROFILE" ]; then
    echo "Error: AWS_PROFILE not specified in config"
    exit 1
fi

# Set default stack name if not provided
if [ -z "$STACK_NAME" ]; then
    STACK_NAME="${GITHUB_ORG}-${REPO_NAME}-github-role"
fi

# Validate required fields
if [ -z "$GITHUB_ORG" ]; then
    echo "Error: GitHub organization not specified in config"
    exit 1
fi

if [ -z "$SSM_PROVIDER_PATH" ]; then
    echo "Error: SSM parameter path for OIDC provider ARN not specified in config"
    exit 1
fi

# Set default role name if not provided
if [ -z "$ROLE_NAME" ]; then
    ROLE_NAME="GitHubActionsRole-${REPO_NAME}"
fi

# Set default region if not provided
if [ -z "$REGION" ]; then
    REGION="eu-west-3"
fi

# Display deployment information
echo "Deploying GitHub Actions IAM Role with:"
echo "- Stack Name: $STACK_NAME"
echo "- GitHub Organization: $GITHUB_ORG"
echo "- Repository Name: $REPO_NAME"
echo "- Branch Name: $BRANCH_NAME"
echo "- Role Name: $ROLE_NAME"
echo "- OIDC Provider SSM Path: $SSM_PROVIDER_PATH"
echo "- Policy ARNs: $POLICY_ARNS"
echo "- AWS Profile: $AWS_PROFILE"
echo "- AWS Region: $REGION"

# Confirm deployment
read -p "Do you want to continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy CloudFormation stack
echo "Deploying CloudFormation stack..."
aws cloudformation deploy \
  --profile "$AWS_PROFILE" \
  --region "$REGION" \
  --template-file "$CFN_TEMPLATE_PATH" \
  --stack-name "$STACK_NAME" \
  --parameter-overrides \
  GitHubOrganization="$GITHUB_ORG" \
  RepositoryName="$REPO_NAME" \
  BranchName="$BRANCH_NAME" \
  RoleName="$ROLE_NAME" \
  OIDCProviderSSMParam="$SSM_PROVIDER_PATH" \
  PolicyARNs="$POLICY_ARNS" \
  --capabilities CAPABILITY_NAMED_IAM

# Get the IAM role ARN
ROLE_ARN=$(aws cloudformation describe-stacks \
  --profile "$AWS_PROFILE" \
  --region "$REGION" \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='RoleARN'].OutputValue" \
  --output text)

# Create a success message
echo "=================================================="
echo "Successfully created IAM role: $ROLE_ARN"
echo ""
echo "Add this as a GitHub secret named AWS_ROLE_ARN in your repository:"
echo "$GITHUB_ORG/$REPO_NAME"
echo ""
echo "For GitHub Actions workflow, use:"
echo "permissions:"
echo "  id-token: write   # Required for OIDC authentication"
echo "  contents: read    # Required to check out code"
echo ""
echo "Configure AWS credentials step:"
echo "- name: Configure AWS Credentials"
echo "  uses: aws-actions/configure-aws-credentials@v4"
echo "  with:"
echo "    role-to-assume: $ROLE_ARN"
echo "    aws-region: $REGION"
echo "=================================================="