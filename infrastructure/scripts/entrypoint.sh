#!/bin/bash
set -e

# CDK directory
CDK_DIR="/src/aws/cdk"
mkdir -p "$CDK_DIR"
cd "$CDK_DIR"

# Initialize CDK project if it doesn't exist
if [[ ! -f "cdk.json" ]]; then
    echo -e "${YELLOW}No CDK project found in $CDK_DIR${NC}"
    echo -e "${CYAN}Initializing new TypeScript CDK project...${NC}"
    cdk init app --language typescript --generate-only

    if [[ ! -f "cdk.json" ]]; then
        echo -e "${RED}Failed to initialize CDK project. Exiting.${NC}"
        exit 1
    fi

    echo -e "${GREEN}CDK project initialized successfully!${NC}"
fi

# Install npm dependencies if package.json exists but node_modules is missing
if [[ -f "package.json" && ( ! -d "node_modules" || ! -f "package-lock.json" ) ]]; then
    echo -e "${CYAN}Installing dependencies...${NC}"
    npm install --legacy-peer-deps
    echo -e "${GREEN}Dependencies installed.${NC}"
else
    echo -e "${GREEN}Dependencies already installed or no package.json present.${NC}"
fi

# Install libraries in case new CDK project was initialized (if not already installed)
if [[ -f "package.json" && ! -d "node_modules" ]]; then
    echo -e "${CYAN}Installing project and CDK libraries...${NC}"
    npm install \
        js-yaml \
        aws-cdk-lib \
        constructs \
        @aws-cdk/aws-s3 \
        @aws-cdk/aws-s3-deployment \
        @aws-cdk/aws-cloudfront \
        @aws-cdk/aws-route53 \
        @aws-cdk/aws-route53-targets \
        @aws-cdk/aws-certificatemanager \
        @aws-cdk/aws-cloudfront-origins
        
    echo -e "${GREEN}CDK libraries installed.${NC}"
fi

# Run passed command (e.g., bash, cdk synth, etc.)
exec "$@"
