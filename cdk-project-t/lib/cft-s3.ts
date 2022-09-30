import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import { WafwebaclToCloudFront } from "@aws-solutions-constructs/aws-wafwebacl-cloudfront";
import { Construct } from 'constructs';
import { backStack  } from "./cog-api-lda-dydb"

export class PruebaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    const BackStack = new backStack (this, "Back");
    const cloudfrontToS3 = new CloudFrontToS3(this, 'cloudfront-s3', {});

      // This construct can only be attached to a configured CloudFront.
    new WafwebaclToCloudFront(this, 'test-wafwebacl-cloudfront', {
      existingCloudFrontWebDistribution: cloudfrontToS3.cloudFrontWebDistribution
      
  })
  
  }
};
