import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

export interface DnsStackProps extends cdk.StackProps {
  domainName: string;
  hostedZoneId: string;
  hostedZoneName: string;
  distribution?: cloudfront.IDistribution;
  bucket: s3.IBucket;
  useCloudFront: boolean;
  tags?: Record<string, string>;
}

export class DnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    // Import the Route 53 hosted zone using fromHostedZoneAttributes
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.hostedZoneName,
      }
    );

    if (props.useCloudFront && props.distribution) {
      // Create A record pointing to CloudFront
      new route53.ARecord(this, "CloudFrontARecord", {
        // Renamed to avoid duplicate id
        zone: hostedZone,
        recordName: props.domainName,
        target: route53.RecordTarget.fromAlias(
          new route53targets.CloudFrontTarget(props.distribution)
        ),
      });
    } else {
      // Create A record pointing to S3 website
      new route53.ARecord(this, "S3ARecord", {
        // Renamed to avoid duplicate id
        zone: hostedZone,
        recordName: props.domainName,
        target: route53.RecordTarget.fromAlias(
          new route53targets.BucketWebsiteTarget(props.bucket as s3.Bucket)
        ),
      });
    }
  }
}
