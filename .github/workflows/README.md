# README.md

# Website Deployment Workflow

This repository contains a GitHub Actions workflow that automatically builds and deploys the blog.nadiarfi.com website to AWS infrastructure using S3 and CloudFront.

## Workflow Overview

The GitHub Actions workflow `Build Static Files and Deploy to S3 Bucket with CloudFront` automates the process of building, validating, and deploying the static website to AWS.

### Key Features

- **Automated Deployment**: Changes to the website source code trigger automatic builds and deployments
- **Secure Authentication**: Uses GitHub OIDC for secure AWS authentication
- **Validation**: Includes code linting and validation steps
- **Optimized Performance**: Configures appropriate caching headers for different file types
- **Deployment Verification**: Checks that the website is accessible after deployment
- **Notifications**: Optional Slack notifications for deployment status updates

## How It Works

The workflow consists of four main jobs:

1. **Validate**: Checks code quality and runs linting
2. **Build**: Compiles the website into static files
3. **Deploy**: Uploads the files to S3 and invalidates CloudFront cache
4. **Notify**: Sends notifications about deployment status

### Workflow Triggers

The workflow runs automatically when:

- Code is pushed to the `main` branch with changes in specified paths:
  - `app/website/src/**`
  - `app/content/**`
  - `app/website/package*.json`
- A pull request is created or updated targeting the `main` branch
- Manually triggered via the GitHub UI with environment selection

### Deployment Process

1. **Code Checkout**: Latest code is fetched from the repository
2. **Dependency Installation**: Node.js modules are installed
3. **Content Preparation**: Content files are copied into the source directory
4. **Build Process**: Static files are generated
5. **AWS Authentication**: Secure authentication via OIDC
6. **Parameter Retrieval**: S3 bucket name and CloudFront distribution ID are fetched from AWS Parameter Store
7. **S3 Deployment**: Files are uploaded to S3 with appropriate cache headers
   - HTML, sitemap, and robots.txt: `no-cache` to ensure fresh content
   - Other assets: Long cache time for performance
8. **Cache Invalidation**: CloudFront cache is invalidated to immediately reflect changes
9. **Verification**: Site accessibility is checked
10. **Notification**: Optional status notifications are sent

## Security

The workflow implements security best practices:

- No AWS credentials are stored in GitHub
- Uses GitHub OIDC for secure, temporary AWS authentication
- Assumes a specific IAM role with limited permissions
- Uses AWS Parameter Store for secret values

## Configuration

### Environment Variables

- `AWS_DEFAULT_REGION`: AWS region for deployment (eu-west-1)
- `SOURCE_DIR`: Directory containing built static files
- `S3_BUCKET_PARAMETER_KEY`: SSM parameter key for S3 bucket name
- `CLOUDFRONT_DISTRIBUTION_ID_PARAMETER_KEY`: SSM parameter key for CloudFront distribution ID
- `GITHUB_ACTIONS_ROLE_NAME`: IAM role name for GitHub Actions

### Required Secrets

- `AWS_ACCOUNT_ID`: Your AWS account ID
- Optional: `SLACK_WEBHOOK_URL` for notifications (if enabled)

## AWS Resources Setup

To use this workflow, you need:

1. An S3 bucket configured for static website hosting
2. A CloudFront distribution connected to the S3 bucket
3. SSM parameters containing the bucket name and CloudFront distribution ID
4. An IAM role with appropriate permissions and OIDC trust configuration

## Local Development

For local development:

1. Clone the repository
2. Navigate to `app/website`
3. Run `npm install`
4. Run `npm run dev` to start the development server

## Manual Deployment

You can manually trigger a deployment:

1. Go to the "Actions" tab in the GitHub repository
2. Select the "Build Static Files and Deploy to S3 Bucket with CloudFront" workflow
3. Click "Run workflow"
4. Select the desired environment (PROD or STAGING)
5. Click "Run workflow" to start the deployment

## Troubleshooting

If deployment fails:

1. Check the workflow logs in GitHub Actions
2. Verify AWS permissions and roles
3. Confirm SSM parameters are correctly set
4. Make sure the S3 bucket and CloudFront distribution exist
5. Check CloudWatch Logs for any AWS-side errors

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Submit a pull request
4. CI will automatically validate your changes
5. After approval and merge, changes will be deployed