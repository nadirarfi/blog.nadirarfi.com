# Cloud-Native Personal Blog on AWS: Automated Deployment of Astro.js Static Site using CDK & GitHub Actions

Visit the live site: blog.nadirarfi.com

This repository hosts the **full-stack infrastructure and application code** for a personal blog focused on **Cloud and DevOps technologies**. It uses **Astro.js** to build the website frontend and **AWS CDK** (TypeScript) to provision and manage cloud infrastructure. The project supports multi-environment deployment (e.g., dev, prod) and integrates with **GitHub Actions** via **OIDC** for CI/CD automation.

---

## Table of Content

1. [📋 Main component](#-main-component)
2. [✨ Summary](#-summary)
3. [📁 Project Structure](#-project-structure)
4. [🖥️ Application: Astro.js Website](#️-application-astrojs-website)
   - [Content Structure](#content-structure)
5. [🏗 Infrastructure: AWS CDK Project](#-infrastructure-aws-cdk-project)
   - [🔀 Deployment Modes](#-deployment-modes)
   - [⚙️ Configuration with YAML](#️-configuration-with-yaml)
   - [🔧 Development Container Setup (setup.sh)](#-development-container-setup-setupsh)
   - [🛠 CDK Usage Examples](#-cdk-usage-examples)
6. [🔐 GitHub Actions & OIDC Role](#-github-actions--oidc-role)
7. [🔄 CI/CD: GitHub Actions](#-cicd-github-actions)
   - [✅ Infrastructure Pipeline (deploy-infra.yaml)](#-infrastructure-pipeline-deploy-infrayamlex)
   - [✅ Website Pipeline (deploy-app.yaml)](#-website-pipeline-deploy-appyaml)
8. [✅ Best Practices Followed](#-best-practices-followed)
9. [📬 Contact](#-contact)


## 📋 Main component

| Section        | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| Application    | Astro.js static website run with Docker locally                     |
| Infrastructure | AWS resources deployed using CDK: S3, CloudFront, ACM, Route53, SSM |
| CI/CD          | GitHub Actions + OIDC Role for secure deployment automation         |

## ✨ Summary

This repository contains everything you need to run a **Cloud & DevOps** focused personal blog:

- **Frontend**: Astro.js static site, served locally via Docker Compose.
- **Infrastructure**: AWS resources (S3, CloudFront, ACM, Route 53, SSM) managed declaratively with AWS CDK and environment YAML configs.
- **CI/CD**: Two GitHub Actions workflows:

  1. **Website**: Builds and deploys static files to S3 & invalidates CloudFront.
  2. **Infrastructure**: Synthesizes and deploys CDK stacks per environment.

Everything is designed for **multi-environment**, **secure**, and **repeatable** deployments.

---

## 📁 Project Structure

```
.
├── app/
│   ├── content/               # Static content for blog
│   └── website/               # Astro.js frontend source code
├── infrastructure/
│   ├── setup.sh               # Dev container launcher script
│   ├── Dockerfile             # CDK dev container definition
│   ├── docker-compose.yaml    # Container orchestration
│   └── src/
│       ├── config/            # YAML config files for each environment
│       │   ├── dev.yaml
│       │   └── prod.yaml
│       └── aws/
│           └── cdk/               # CDK app source code
│               ├── bin/           # Entry point
│               ├── lib/           # Stack definitions
│               └── package.json
└── .github/workflows/
    ├── deploy-app.yaml        # Static website deployment to S3
    └── deploy-infra.yaml      # CDK deployment using GitHub OIDC
```

---

## 🖥️ Application: Astro.js Website

The static website is built using [Astro.js](https://astro.build/) open source template. You can run it locally inside a Docker container:

```bash
docker compose \
    -f docker-compose.yaml run --rm --build \
    -p 8080:8080 \
    website_local
```

Website content lives in `app/content/` and the build system in `app/website/`.

### Content Structure

Markdown blog posts live in the `app/content/blog/` directory. Example:

```
app/
├─ content/
│  ├─ blog/
│  │  ├─ cicd-pipelines-automate-your-way-to-faster-releases.md
│  │  ├─ cloud-architecture-design-scalable-and-resilient-systems.md
│  │  └─ ... other posts ...
│  └─ projects/
├─ website/
│  ├─ public/
│  └─ src/
│     ├─ components/
│     ├─ layouts/
│     ├─ pages/
│     └─ styles/
```

The content folder is then injected into the Astro build step in order to be able to write blog posts and separate it from the frontend template code.

## 🏗 Infrastructure: AWS CDK Project

AWS CDK project in `infrastructure/src/aws/cdk` provision the following:

- **S3** for static website hosting
- **CloudFront** (optional) for secure HTTPS delivery
- **ACM** (in `us-east-1` for CloudFront) for automatic SSL certificates
- **Route53** for DNS records and domain support
- **SSM Parameter Store** for dynamic values like Hosted Zone ID and Bucket names which can be used for cross-stack parameters and also Github Actions pipelines

### 🔀 Deployment Modes

| useCloudFront | useCustomDomain | Result                                   |
| ------------- | --------------- | ---------------------------------------- |
| false         | false           | Basic S3 site with default S3 URL        |
| false         | true            | S3 with custom domain (HTTP only)        |
| true          | false           | CloudFront with default domain (HTTPS)   |
| true          | true            | Full CDN + Custom Domain + HTTPS via ACM |

### ⚙️ Configuration with YAML

Environment-specific configuration is stored in `src/aws/config/*.yaml`. Example:

```yaml
environment: prod

domain:
  name: blog.nadirarfi.com
  hostedZoneName: nadirarfi.com

features:
  useCloudFront: true
  useCustomDomain: true

aws:
  certificateRegion: us-east-1
  deploymentRegion: eu-west-1
  account: null
  ssm:
    hostedZoneIdSsmParam: /arfin/aws/ssm/route53/dns/public/hostedzone/nadirarfi.com/id
    cloudFrontDistributionIdSsmParam: /arfin/aws/ssm/prod/blog/nadiarfi/com/cloudfront/distribution/id
    s3BucketNameSsmParam: /arfin/aws/ssm/prod/blog/nadiarfi/com/s3/bucket/name

tags:
  Environment: prod
  Project: blog.nadirarfi.com
  IaC: CDK
```

### 🔧 Development Container Setup (`setup.sh`)

A helper to initialize your local CDK dev container:

- Ensures `.env` file exists (or prompts you)
- Reads AWS profile & region (interactive if needed)
- Verifies AWS credentials via `aws sts get-caller-identity`
- Generates `.env` from `.env.template` (populating AWS_PROFILE, CDK_DEFAULT_REGION, CDK_DEFAULT_ACCOUNT)
- Launches Docker Compose to build and drop you into a `cdk-dev` CDK dev container for development and testing
- Mounts your local `~/.aws` directory as read-only for authentication

Run this from `infrastructure/`:

```bash
cd infrastructure
./setup.sh
```

Inside the container you get:

- AWS CLI
- AWS CDK
- Node.js
- TypeScript

### 🛠 CDK Usage Examples

```bash
# Inside container
cd /src/aws/cdk

# View planned changes
cdk diff --context env=dev

# Deploy infrastructure
cdk deploy --all --context env=prod

# Destroy when needed
cdk destroy --all --context env=dev
```

#### How It Works

The containerized development environment simplifies the setup process and ensures that everyone trying the project has the same environment, regardless of their local machine's configuration. The Docker container includes all necessary tools and dependencies, and the AWS configuration is securely mounted from your local machine.

The CDK app uses the environment context value (set with `--context env=dev` or similar) to load the appropriate YAML configuration file and create stacks with environment-specific settings.

After deployment, the stacks produce outputs with URLs and other important information about the created resources. Then after that, we can simplfy upload our website static files into the s3 bucket.

---

## 🔐 GitHub Actions & OIDC Role

Before setting up GitHub Actions, you must **create an IAM Role with OIDC trust** so GitHub can deploy to your AWS account securely.
Run the script in `github-oidc/` to create an IAM role trusting GitHub’s OIDC provider. This role grants `sts:AssumeRoleWithWebIdentity` permission to your workflows.
Make sure to change the default values:

```bash

# Default values
TEMPLATE_FILE="github-oidc.cfn.yaml"
REPO_NAME="<REPO_NAME>"
BRANCH_NAME="main"
ROLE_NAME="GitHubActionsRole"
USE_EXISTING="no"
AWS_PROFILE="<AWS_PROFILE>"
GITHUB_ORG="<GITHUB_USERNAME>"
STACK_NAME="$GITHUB_ORG-$REPO_NAME-github-actions-oidc"

```

Use the script in `infrastructure/github-oidc/`:

```bash
cd infrastructure/github-oidc
./github-oidc-deploy.sh
```

GitHub Actions uses this role to authenticate without needing long-lived credentials.

---

## 🔄 CI/CD: GitHub Actions

### ✅ Infrastructure Pipeline (`deploy-infra.yaml`)

Deploys infrastructure (`.github/workflows/deploy-infra.yml`)

- **Triggers**: `push` on `main` (changes to `infrastructure/src/aws/cdk` or `config`), and manual `workflow_dispatch`
- **Steps**:

  - Checkout code
  - Configure AWS credentials via OIDC role
  - Setup Node.js & install CDK globally
  - Install project dependencies
  - `cdk synth --all --context env=<env>`
  - `cdk diff --all --context env=<env>` (summarized)
  - `cdk deploy --all --context env=<env> --require-approval never`
  - Post‑deployment: list CloudFormation stack statuses

### ✅ Website Pipeline (`deploy-app.yaml`)

Deploys the static website (`.github/workflows/deploy-app.yml`):

- **Triggers**: `push` & `pull_request` on `main` (changes to `app/website` or `app/content`), and manual `workflow_dispatch`
- **Build**:

  - Checkout code
  - Setup Node.js
  - Install dependencies in `app/website`
  - Copy `app/content` → `app/website/src/content`
  - Run `npm run build` (Astro.js)
  - Upload artifact (`dist/client`)

- **Deploy** (on `push` or manual):

  - Download artifact
  - Configure AWS credentials via OIDC role
  - Fetch S3 bucket & CloudFront distribution IDs from SSM
  - `aws s3 sync` with fine‑grained cache control
  - Create CloudFront invalidation
  - Optional curl-based health check
  - Summary

---

## ✅ Best Practices Followed

- Environments fully isolated (dev, prod)
- Secure deployment via GitHub OIDC
- Minimal IAM permissions
- Dockerized dev setup for reproducibility
- Config files separated from code
- HTTPS by default with CloudFront + ACM

---

## 📬 Contact

This project is maintained by [Nadir Arfi](https://github.com/nadirarfi).
Feel free to reach out for questions or contributions.

---
