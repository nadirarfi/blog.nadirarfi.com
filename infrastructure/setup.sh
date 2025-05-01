#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color


# Check if the src directory exists
if [ ! -d "src" ]; then
  mkdir -p src
  echo "Directory src created"
fi


echo -e "${BLUE}=== AWS CDK Development Container Launcher ===${NC}"

# Check if .env file exists and load it
if [ -f .env ]; then
  echo -e "${BLUE}Loading environment from .env file...${NC}"
  export $(grep -v '^#' .env | xargs)
else
  echo -e "${YELLOW}No .env file found. Using environment variables only.${NC}"
fi

# Function to prompt for AWS profile
select_aws_profile() {
  # Get available profiles using AWS CLI
  AVAILABLE_PROFILES=$(aws configure list-profiles 2>/dev/null)
  
  if [ -z "$AVAILABLE_PROFILES" ]; then
    echo -e "${RED}No AWS profiles found. Please configure your AWS credentials first.${NC}"
    exit 1
  fi
  
  # Display available profiles
  echo -e "${YELLOW}Available AWS profiles:${NC}"
  echo "$AVAILABLE_PROFILES" | sort

  # Prompt for profile name
  echo -e "${YELLOW}Enter AWS profile name to use:${NC}"
  read -r input_profile
  
  # Check if profile exists
  if ! aws configure list-profiles | grep -q "^${input_profile}$"; then
    echo -e "${RED}Profile '$input_profile' not found. Please enter a valid profile name.${NC}"
    exit 1
  fi
  
  export AWS_PROFILE=$input_profile
}

# Check if AWS_PROFILE is set (either from .env or environment)
if [ -z "$AWS_PROFILE" ]; then
  echo -e "${YELLOW}No AWS_PROFILE set in environment or .env file.${NC}"
  select_aws_profile
else
  echo -e "${GREEN}Using AWS_PROFILE from environment: ${AWS_PROFILE}${NC}"
  
  # Validate that the profile exists
  if ! aws configure list-profiles | grep -q "^${AWS_PROFILE}$"; then
    echo -e "${RED}Profile '$AWS_PROFILE' not found in AWS config. Please check your configuration.${NC}"
    echo -e "${YELLOW}Would you like to select a different profile? (y/n)${NC}"
    read -r choice
    if [[ "$choice" =~ ^[Yy]$ ]]; then
      select_aws_profile
    else
      exit 1
    fi
  fi
fi

echo -e "${GREEN}Using AWS profile: ${AWS_PROFILE}${NC}"

# Verify profile and get account info
echo -e "${BLUE}Verifying credentials...${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text 2>&1)

if [ $? -ne 0 ]; then
  echo -e "${RED}Error verifying AWS credentials:${NC}"
  echo "$AWS_ACCOUNT_ID"
  exit 1
fi

# Get region
AWS_REGION=$(aws configure get region --profile $AWS_PROFILE)
if [ -z "$AWS_REGION" ]; then
  echo -e "${YELLOW}No region found in profile. Please enter AWS region:${NC}"
  read -r AWS_REGION
  
  if [ -z "$AWS_REGION" ]; then
    echo -e "${RED}Region cannot be empty. Exiting.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}Starting container with:${NC}"
echo -e "  ${BLUE}AWS Profile:${NC} $AWS_PROFILE"
echo -e "  ${BLUE}Account ID:${NC} $AWS_ACCOUNT_ID"
echo -e "  ${BLUE}Region:${NC} $AWS_REGION"

# Create .env from .env.template
sed \
  -e "s|<AWS_PROFILE>|$AWS_PROFILE|g" \
  -e "s|<CDK_DEFAULT_REGION>|$AWS_REGION|g" \
  -e "s|<CDK_DEFAULT_ACCOUNT>|$AWS_ACCOUNT_ID|g" \
  .env.template > .env

# docker compose -f docker-compose.yaml down -v
# DOCKER_BUILDKIT=0 docker compose -f docker-compose.yaml run --build cdk-dev 
docker compose -f docker-compose.yaml run --rm --build  \
  cdk-dev bash -c "cd /src/aws/cdk && exec bash"