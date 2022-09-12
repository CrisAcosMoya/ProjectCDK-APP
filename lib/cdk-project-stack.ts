import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import { WafwebaclToCloudFront } from "@aws-solutions-constructs/aws-wafwebacl-cloudfront";
import { CognitoToApiGatewayToLambda } from '@aws-solutions-constructs/aws-cognito-apigateway-lambda';
import { ApiGatewayToSqs, ApiGatewayToSqsProps } from "@aws-solutions-constructs/aws-apigateway-sqs";
import { SqsToLambda, SqsToLambdaProps } from "@aws-solutions-constructs/aws-sqs-lambda";
import { LambdaToDynamoDBProps, LambdaToDynamoDB } from '@aws-solutions-constructs/aws-lambda-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class CdkProjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    // cloudfront - s3
    const cloudfrontToS3 = new CloudFrontToS3(this, 'test-cloudfront-s3', {});

    // CloudFront - waf
    new WafwebaclToCloudFront(this, 'test-wafwebacl-cloudfront', {
      existingCloudFrontWebDistribution: cloudfrontToS3.cloudFrontWebDistribution
    });
    
    // cognito - gateway - lambda
    new CognitoToApiGatewayToLambda(this, 'test-cognito-apigateway-lambda', {
      lambdaFunctionProps: {
      code: lambda.Code.fromAsset(`lambda`),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler'
      }
    });
    
    // gateway - sqs
    new ApiGatewayToSqs(this, 'ApiGatewayToSqsPattern', {});
    
    
    // sqs - lambda
    new SqsToLambda(this, 'SqsToLambdaPattern', {
      lambdaFunctionProps: {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(`lambda`)
    }
    });
    
    // lambda - dynamodb
    const constructProps: LambdaToDynamoDBProps = {
      lambdaFunctionProps: {
      code: lambda.Code.fromAsset(`lambda`),
      runtime: lambda.Runtime.NODEJS_14_X,
     handler: 'index.handler'
      },
    };

    new LambdaToDynamoDB(this, 'test-lambda-dynamodb-stack', constructProps);


  }
}
