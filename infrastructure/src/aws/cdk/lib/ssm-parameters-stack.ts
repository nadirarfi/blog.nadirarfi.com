import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";

export interface SsmParametersStackProps extends cdk.StackProps {
  hostedZoneIdSsmParam: string; // SSM parameter key for hosted zone ID
  tags?: Record<string, string>;
}

export class SsmParametersStack extends cdk.Stack {
  public readonly hostedZoneId: string;

  constructor(scope: Construct, id: string, props: SsmParametersStackProps) {
    super(scope, id, props);

    // Retrieve the hosted zone ID from SSM
    this.hostedZoneId = ssm.StringParameter.valueForStringParameter(
      this,
      props.hostedZoneIdSsmParam
    );

    // Output the retrieved value for verification
    new cdk.CfnOutput(this, "RetrievedHostedZoneId", {
      value: this.hostedZoneId,
      description: "Retrieved Hosted Zone ID from SSM",
    });
  }
}
