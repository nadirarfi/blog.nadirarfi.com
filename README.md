# Static Website CDK Infrastructure for Personal Blog

This CDK (Cloud Development Kit) project allows you to quickly deploy a personal blog website on AWS using S3, CloudFront, ACM certificates, and Route 53. The infrastructure can be tailored to different environments through simple YAML configuration files.

## Features

- **S3 Website Hosting**: Deploy your blog content to Amazon S3
- **CloudFront Distribution** (optional): Serve your blog securely via CloudFront CDN 
- **Custom Domain Support** (optional): Use your own domain with an existing Route 53 hosted zone
- **SSL Certificates** (automatic): Auto-generated and validated certificates for secure HTTPS access
- **Multi-Environment Support**: Different configurations for development and production environments

### Deployment Options

| useCloudFront | useCustomDomain | Result |
|---------------|----------------|--------|
| false | false | Basic S3 website with default S3 URL |
| false | true  | S3 website with your custom domain (HTTP only) |
| true  | false | CloudFront distribution with default domain (HTTPS) |
| true  | true  | CloudFront distribution with your custom domain (HTTPS) |

## Prerequisites

- **Docker**: Used to create a consistent development environment
- **Docker Compose**: Used to orchestrate the development container
- **AWS Configuration**: Valid AWS credentials configured in your `~/.aws` directory
  - The project mounts your local AWS credentials into the container (read-only)
  - You should have a valid AWS profile configured on your local machine

## Development Environment

This project uses a containerized development environment to ensure consistency and simplify setup. The development container includes all necessary tools:

- AWS CLI
- AWS CDK
- Node.js
- TypeScript
- Other required dependencies

### Setup Process

```bash
git clone https://github.com/nadirarfi/blog.nadirarfi.com.git
cd blog.nadirarfi.com/infrastructure
./setup.sh
```

The setup script performs the following actions:
- The script will ask to type down the target aws profile configured
- Creates a `.env` file from `.env.template`, substituting automatically your AWS profile, region, and account ID
- Builds the Docker development container
- Installs required dependencies inside the container
- Sets up the AWS CDK environment

## How It Works

The containerized development environment simplifies the setup process and ensures that everyone trying the project has the same environment, regardless of their local machine's configuration. The Docker container includes all necessary tools and dependencies, and the AWS configuration is securely mounted from your local machine.

The CDK module creates several stacks that work together:

1. **Certificate Stack**: Creates and validates an SSL certificate
2. **Static Website Stack**: Creates the S3 bucket for hosting your blog content and optionally a CloudFront distribution
3. **DNS Stack**: Sets up Route 53 DNS records pointing to your website

The CDK app uses the environment context value (set with `--context env=dev` or similar) to load the appropriate YAML configuration file and create stacks with environment-specific settings.

After deployment, the stacks produce outputs with URLs and other important information about the created resources. Then after that, we can simplfy upload our website static files into the s3 bucket.

## Project Structure

```

          infrastructure
          ├── Dockerfile              # Defines the development container
          ├── docker-compose.yaml     # Configuration for the container
          ├── setup.sh                # Setup script for initial configuration
          ├── scripts/                # Container setup and entrypoint scripts
          └── src/aws/                    # Source code for the CDK project
                      ├── /cconfig/             # Environment configuration files
                      │   ├── dev.yaml
                      │   └── prod.yaml
                      └── cdk/
                          ├── bin/                # CDK application entry point
                          │   └── website-cdk.ts  # Main app entry point
                          ├── lib/                # CDK stack definitions
                          │   ├── acm-certificate-stack.ts
                          │   ├── config-loader.ts
                          │   ├── route53-dns-stack.ts
                          │   └── static-website-stack.ts    
                          └── package.json        # Node.js dependencies
```

### Environment Configuration

The `.env` file contains important configurations:
- `AWS_PROFILE`: The AWS profile to use for deployment
- `CDK_DEFAULT_REGION`: The default AWS region for deployment
- `CDK_DEFAULT_ACCOUNT`: The AWS account ID for deployment

The Docker development container:
- Mounts your local `~/.aws` directory as read-only for authentication
- Mounts the `./src` directory as a volume for your project code
- Uses environment variables from the `.env` file

## Configuring Your Blog Infrastructure

The project uses YAML files for configuration. These files are located in the `src/config/` directory and contain all the settings needed for deployment.

### Configuration Files

Edit the configuration files (`dev.yaml`, `prod.yaml`) in the `src/config/` directory to customize your blog deployment:

```yaml
environment: dev                      # Environment name (dev, prod)
domain:
  name: dev.nadirarfi.com              # Your blog domain name
  hostedZoneName: nadirarfi.com        # Your Route 53 hosted zone name
  hostedZoneIdParam: /aws/ssm/route53/dns/public/hostedzone/nadirarfi.com/id  # SSM parameter name for your hosted zone ID

features:
  useCloudFront: true                 # Whether to use CloudFront or just S3
  useCustomDomain: true               # Whether to use a custom domain

aws:
  certificateRegion: us-east-1        # Region for ACM certificate (must be us-east-1 for CloudFront)
  deploymentRegion: us-east-1         # Region to deploy resources
  account: null                       # AWS account ID (null to use CDK default)

tags:                                 # Tags to apply to all resources
  Environment: dev
  Project: PersonalBlog
```

## Infrastructure Deployment


### Using SSM Parameter Store for Hosted Zone ID
Instead of hardcoding the Hosted Zone ID in your configuration files, you can store it in AWS Systems Manager Parameter Store and reference it by parameter name:

## Using SSM Parameter Store for Hosted Zone IDs

Instead of hardcoding the Hosted Zone ID in your configuration files, you can store it in AWS Systems Manager Parameter Store and reference it by parameter name:

```bash
# Inside the container
aws ssm put-parameter \
--name "<ssm_parameter_key>" \ 
--value "<hostedzone_id>" \
--type "String" \
--profile <aws_profile> \
--region <aws_region>
```
All commands should be run inside the development container. The container is automatically started when you run the setup script.

```bash

# Inside the container:

# Synthesize CloudFormation for environment
cdk synth --context env=dev
cdk synth --context env=prod

# Deploy to specific environment
cdk deploy --all --context env=dev
cdk deploy --all --context env=prod

# Check differences before deployment
cdk diff --context env=dev
cdk diff --context env=prod

# Destroy resources when no longer needed
cdk destroy --all --context env=dev
cdk destroy --all --context env=prod
```

## Security and Best Practices

- This setup follows AWS best practices for hosting static websites
- Using CloudFront provides HTTPS by default, improving SEO and security
- The development container isolates dependencies and ensures consistent deployments
- AWS credentials are mounted read-only for security

---