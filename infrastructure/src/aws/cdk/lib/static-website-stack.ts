// Import necessary AWS CDK modules
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3"; // S3 module

import * as cloudfront from "aws-cdk-lib/aws-cloudfront"; // CloudFront module
import * as origins from "aws-cdk-lib/aws-cloudfront-origins"; // CloudFront origins module
import * as acm from "aws-cdk-lib/aws-certificatemanager"; // ACM module
import * as ssm from "aws-cdk-lib/aws-ssm"; // SSM module

enum SsmParamKey {
  CLOUDFRONT_DISTRIBUTION_ID = "cloudFrontDistributionId",
  S3_BUCKET_NAME = "s3BucketName",
}

// Define the properties for the StaticWebsiteStack
export interface StaticWebsiteStackProps extends cdk.StackProps {
  domainName: string;
  certificateArn?: string;
  useCloudFront: boolean;
  useCustomDomain: boolean;
  ssmParams: Partial<Record<SsmParamKey, string>>;
  tags?: Record<string, string>;
}

// Define the StaticWebsiteStack class
export class StaticWebsiteStack extends cdk.Stack {
  // Properties to be exposed by the stack
  public readonly bucketName: string;
  public readonly distribution?: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;
  public readonly websiteUrl: string;

  // Constructor for the StaticWebsiteStack
  constructor(scope: Construct, id: string, props: StaticWebsiteStackProps) {
    super(scope, id, props);

    // Create an S3 bucket for hosting the website
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      // Index document for the website
      websiteIndexDocument: "index.html",
      // Error document for the website
      websiteErrorDocument: "error.html",
      // Removal policy for the bucket (destroy when stack is deleted)
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // Automatically delete objects when the bucket is deleted
      autoDeleteObjects: true,
      cors: [
        {
          allowedOrigins: [
            "https://blog.nadirarfi.com",
            "https://www.nadirarfi.com",
          ],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedHeaders: ["*"],
        },
      ],
      // Make the bucket publicly readable if not using CloudFront
      publicReadAccess: !props.useCloudFront,
      // Block public access if using CloudFront with OAC
      blockPublicAccess: props.useCloudFront
        ? s3.BlockPublicAccess.BLOCK_ALL
        : s3.BlockPublicAccess.BLOCK_ACLS,
    });

    // Assign the bucket to the stack properties
    this.bucket = websiteBucket;
    this.bucketName = websiteBucket.bucketName;

    if (props.ssmParams.s3BucketName) {
      new ssm.StringParameter(this, "S3BucketNameSsmParam", {
        parameterName: props.ssmParams.s3BucketName,
        stringValue: websiteBucket.bucketName,
        description: "S3 bucket name",
      });
    }

    // Check if CloudFront is being used
    if (props.useCloudFront) {
      // If using custom domain and certificate is provided
      let domainNames: string[] | undefined;
      let certificate: acm.ICertificate | undefined;

      if (props.useCustomDomain && props.certificateArn) {
        // Use the provided domain name
        domainNames = [props.domainName];
        // Import the certificate from the provided ARN
        certificate = acm.Certificate.fromCertificateArn(
          this,
          "ImportedCertificate",
          props.certificateArn
        );
      }

      const oac = new cloudfront.S3OriginAccessControl(
        this,
        "DistributionStaticWebsiteOAC",
        {
          signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
        }
      );

      const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(
        websiteBucket,
        {
          originAccessControl: oac,
        }
      );

      // Create a CloudFront Function for URL normalization
      const urlNormalizationFunction = new cloudfront.Function(
        this,
        "UrlNormalizationFunction",
        {
          functionName: "url-normalization-function",
          code: cloudfront.FunctionCode.fromInline(`
          function handler(event) {
            var request = event.request;
            var uri = request.uri;

            // Normalize /index.html URLs
            if (uri.endsWith('/index.html')) {
              // Redirect to the URI without index.html
              var redirectUri = uri.slice(0, -10); // Remove '/index.html'
              if (redirectUri === '') redirectUri = '/';

              // Return a 301 redirect
              return {
                statusCode: 301,
                statusDescription: 'Moved Permanently',
                headers: {
                  'location': { value: redirectUri }
                }
              };
            }

            // Handle directory URIs (no extension)
            if (!uri.includes('.')) {
              // Avoid double slashes
              if (uri.endsWith('/')) {
                request.uri = uri + 'index.html';
              } else {
                request.uri = uri + '/index.html';
              }
            }

            return request;
          }
        `),
          runtime: cloudfront.FunctionRuntime.JS_2_0,
          comment: "Normalizes URLs to improve user experience and SEO",
        }
      );

      // Create a CloudFront distribution
      const distribution = new cloudfront.Distribution(this, "Distribution", {
        // Default behavior for the distribution
        defaultBehavior: {
          // Origin for the distribution (S3 bucket with OAC)
          origin: s3Origin,
          // Viewer protocol policy (redirect to HTTPS)
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          // Allowed methods (GET, HEAD, OPTIONS)
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          // Cache policy (optimized for caching)
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          // Attach the URL normalization function
          functionAssociations: [
            {
              function: urlNormalizationFunction,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
        // Default root object for the distribution (index.html)
        defaultRootObject: "index.html",
        // Error responses for the distribution (404 error page)
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 404,
            responsePagePath: "/404.html",
          },
        ],
        // Domain names for the distribution (if using custom domain)
        domainNames: domainNames,
        // Certificate for the distribution (if using custom domain)
        certificate: certificate,
      });

      // Assign the distribution to the stack properties
      this.distribution = distribution;

      // Set the website URL based on custom domain or CloudFront domain
      if (props.useCustomDomain) {
        this.websiteUrl = `https://${props.domainName}`;
      } else {
        this.websiteUrl = `https://${distribution.distributionDomainName}`;
      }

      // Output the CloudFront distribution domain name
      new cdk.CfnOutput(this, "DistributionDomainName", {
        value: distribution.distributionDomainName,
        description: "CloudFront distribution domain name",
      });

      // Create an SSM parameter for the CloudFront distribution ID
      if (props.ssmParams.cloudFrontDistributionId) {
        new ssm.StringParameter(this, "CloudFrontDistributionIdSsmParam", {
          parameterName: props.ssmParams.cloudFrontDistributionId,
          stringValue: distribution.distributionId,
          description: "CloudFront distribution ID",
        });
      }
    } else {
      // If not using CloudFront, use S3 website hosting directly
      this.websiteUrl = props.useCustomDomain
        ? `http://${props.domainName}`
        : `http://${websiteBucket.bucketWebsiteDomainName}`;
    }

    // Output the S3 bucket website URL
    new cdk.CfnOutput(this, "BucketWebsiteUrl", {
      value: `http://${websiteBucket.bucketWebsiteDomainName}`,
      description: "S3 bucket website URL",
    });

    // Output the configured website URL
    new cdk.CfnOutput(this, "WebsiteUrl", {
      value: this.websiteUrl,
      description: "Website URL",
    });
  }
}
