import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export interface GithubOidcStackProps extends cdk.StackProps {
  readonly githubOrganization: string;
  readonly repositoryName: string;
  readonly branchName: string;
  readonly roleName: string;
  readonly useExistingProvider: string;
}

export class GithubOidcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GithubOidcStackProps) {
    super(scope, id, props);

    const createProvider = props.useExistingProvider.toLowerCase() === "no";

    let oidcProvider: iam.OpenIdConnectProvider | undefined;

    if (createProvider) {
      oidcProvider = new iam.OpenIdConnectProvider(this, "IdpGitHubOidc", {
        url: "https://token.actions.githubusercontent.com",
        clientIds: [
          "sts.amazonaws.com",
          `https://github.com/${props.githubOrganization}/${props.repositoryName}`,
        ],
        thumbprints: ["6938fd4d98bab03faadb97b34396831e3780aea1"],
      });
      cdk.Tags.of(oidcProvider).add("Name", `${props.roleName}-OIDC-Provider`);
    }

    const role = new iam.Role(this, "RoleGithubActions", {
      roleName: props.roleName,
      assumedBy: new iam.FederatedPrincipal(
        createProvider
          ? oidcProvider!.openIdConnectProviderArn
          : `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
          StringLike: {
            "token.actions.githubusercontent.com:sub": `repo:${props.githubOrganization}/${props.repositoryName}:*`,
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    if (createProvider) {
      new cdk.CfnOutput(this, "IdpGitHubOidcARN", {
        value: oidcProvider!.openIdConnectProviderArn,
        description: "ARN of Github OIDC Provider",
      });
    }

    new cdk.CfnOutput(this, "RoleGithubActionsARN", {
      value: role.roleArn,
      description: "CICD Role for GitHub Actions",
    });
  }
}
