#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SsmParametersStack } from "../lib/ssm-parameters-stack";
import { CertificateStack } from "../lib/acm-certificate-stack";
import { StaticWebsiteStack } from "../lib/static-website-stack";
import { DnsStack } from "../lib/route53-dns-stack";
import { loadConfig, WebsiteConfig } from "../config-loader";

// Parse command line arguments to get environment
const app = new cdk.App({
  context: {
    '@aws-cdk/core:crossRegionReferences': true,
  },
});

// Get environment from command line or use default
const environment = app.node.tryGetContext('env') || 'dev';
console.log(`Deploying to ${environment} environment`);

// Load configuration for the specified environment
const config: WebsiteConfig = loadConfig(environment);

// Create stack name prefixed with environment
const stackPrefix = `${config.environment}-website`;

// Create SSM Parameters stack to retrieve configuration
const ssmStack = new SsmParametersStack(app, `${stackPrefix}-ssm-params`, {
  hostedZoneIdSsmParam: config.domain.hostedZoneIdSsmParam,
  env: {
    account: config.aws.account || process.env.CDK_DEFAULT_ACCOUNT,
    region: config.aws.deploymentRegion || process.env.CDK_DEFAULT_REGION
  },
  description: `SSM Parameters for ${config.domain.name} (${config.environment})`,
  tags: config.tags,
});

// Create certificate stack if using CloudFront with custom domain
let certificateArn: string | undefined;

if (config.features.useCustomDomain && config.features.useCloudFront) {
  const certificateStack = new CertificateStack(app, `${stackPrefix}-certificate`, {
    domainName: config.domain.name,
    hostedZoneId: ssmStack.hostedZoneId,
    description: `ACM Certificate for ${config.domain.name} (${config.environment})`,
    crossRegionReferences: true,
    tags: config.tags,
  });
  
  certificateArn = certificateStack.certificateArn;
}

// Create the static website stack
const websiteStack = new StaticWebsiteStack(app, `${stackPrefix}-static`, {
  domainName: config.domain.name,
  certificateArn: certificateArn,
  useCloudFront: config.features.useCloudFront,
  useCustomDomain: config.features.useCustomDomain,
  env: {
    account: config.aws.account || process.env.CDK_DEFAULT_ACCOUNT,
    region: config.aws.deploymentRegion || process.env.CDK_DEFAULT_REGION
  },
  description: `Static website infrastructure for ${config.domain.name} (${config.environment})`,
  crossRegionReferences: true,
  tags: config.tags,
});

// Create DNS stack only if using custom domain
if (config.features.useCustomDomain) {

  const dnsStack = new DnsStack(app, `${stackPrefix}-dns`, {
    domainName: config.domain.name,
    hostedZoneName: config.domain.hostedZoneName,
    hostedZoneId: ssmStack.hostedZoneId,
    distribution: config.features.useCloudFront ? websiteStack.distribution : undefined,
    bucket: websiteStack.bucket,
    useCloudFront: config.features.useCloudFront,
    env: {
      account: config.aws.account || process.env.CDK_DEFAULT_ACCOUNT,
      region: config.aws.deploymentRegion || process.env.CDK_DEFAULT_REGION
    },
    description: `DNS records for ${config.domain.name} (${config.environment})`,
    crossRegionReferences: true,
    tags: config.tags,    
  });

}

app.synth();
