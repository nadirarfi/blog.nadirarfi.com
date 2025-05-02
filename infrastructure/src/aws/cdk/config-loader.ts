import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

export interface DomainConfig {
  name: string;
  hostedZoneName: string;
}

export interface FeatureFlags {
  useCloudFront: boolean;
  useCustomDomain: boolean;
}

export interface AwsConfig {
  certificateRegion: string;
  deploymentRegion: string;
  account: string | null;
  ssm: Record<string, string>;
}

export interface GithubConfig {
  organization: string;
  repository: string;
  oidc: Record<string, string>;
}

export interface WebsiteConfig {
  environment: string;
  aws: AwsConfig;
  github: GithubConfig;
  domain: DomainConfig;
  features: FeatureFlags;
  tags: Record<string, string>;
}

export function loadConfig(environment: string): WebsiteConfig {
  const configPath = path.join(
    __dirname,
    "..",
    "config",
    `${environment}.yaml`
  );

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Configuration file for environment '${environment}' not found at ${configPath}`
    );
  }

  const configContent = fs.readFileSync(configPath, "utf8");
  const config = yaml.load(configContent) as WebsiteConfig;

  // Fill in the account if not specified
  if (!config.aws.account) {
    config.aws.account = process.env.CDK_DEFAULT_ACCOUNT || "";
  }

  return config;
}
