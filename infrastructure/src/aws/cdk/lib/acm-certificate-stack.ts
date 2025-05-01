import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";

export interface CertificateStackProps extends cdk.StackProps {
  domainName: string;
  hostedZoneId: string;
  tags?: Record<string, string>;
}

export class CertificateStack extends cdk.Stack {
  public readonly certificateArn: string;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: "us-east-1", // ACM certificate must be in us-east-1 for CloudFront
      },
    });

    // Import the hosted zone using the provided ID
    const hostedZone = route53.HostedZone.fromHostedZoneId(
      this, 
      "HostedZone", 
      props.hostedZoneId
    );

    // Create ACM certificate with DNS validation
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    this.certificateArn = certificate.certificateArn;

    // Output the certificate ARN
    new cdk.CfnOutput(this, "CertificateArn", {
      value: this.certificateArn,
      description: "Certificate ARN",
    });
  }
}
