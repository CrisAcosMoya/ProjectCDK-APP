import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as s3 from "aws-cdk-lib/aws-s3"
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class backStack extends Construct {
    
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id );
  
    // crear un nuevo grupo de usuarios
    const Pool = new cognito.UserPool(scope, 'userpool-test', {
      userPoolName: 'myawesomeapp-userpool',
      
      
              // recuperacion de cuenta
        accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      
      // inicio sesion
      signInAliases: {
      username: true,
      email: true,
      },
      autoVerify: {
       email : true, 
      },
      selfSignUpEnabled: true,
      // atributos 
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
          },
      },
      // contraseña rquerimientos
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
        },
      

    });
    
      const fullAccessScope = new cognito.ResourceServerScope({ scopeName: 'administration', scopeDescription: 'Full access' });
     
      const userServer = Pool.addResourceServer('ResourceServer', {
        identifier: 'user-api-products',
        scopes: [  fullAccessScope ],
      });
    
     
      // authorizer created in apigateway
      const auth = new apigateway.CognitoUserPoolsAuthorizer(this, 'Cog-Authorizer', {
        cognitoUserPools: [Pool]
      });
    
    // configuracion app - client
      Pool.addClient('app-client', {
        generateSecret: true,
        oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [ cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.resourceServer(userServer, fullAccessScope ) ], 
        callbackUrls: [ 'https://oauth.pstmn.io/v1/browser-callback' ],
        logoutUrls: [ 'https://my-app-domain.com/signin' ],
        },
      
      });
    
    
    
     

 /////////////////////////////////////////////////////////////////////////////     
      
      // bucket s3 - storage lambda function
    const bucketLambdaFun = new s3.Bucket(this, 'BucketLambdaFunctions');  
      
      
            //Dynamodb table definition
    const tabledb = new dynamodb.Table(this, "dynamo-table", {
      partitionKey: { name: "productId", type: dynamodb.AttributeType.STRING },
    });

    // lambda function 
    const dynamoLambda = new lambda.Function(this, "DynamoLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: new lambda.InlineCode("Hello"),
      handler: "functions.handler",
    });

    // permissions to lambda to dynamo table GET
    tabledb.grantReadWriteData(dynamoLambda);
    bucketLambdaFun.grantRead(dynamoLambda);
    
    

    
    // apigateway resources - authorization cognito 
    const api = new apigateway.RestApi(this, 'product-api');

      

    const product = api.root.addResource('product');
      product.addMethod('GET', new apigateway.LambdaIntegration(dynamoLambda), {
      authorizationScopes : [ "user-api-products/administration" ],
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      });
      product.addMethod('POST', new apigateway.LambdaIntegration(dynamoLambda), {
      authorizationScopes : [ "user-api-products/administration" ],
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      });
      product.addMethod('PATCH', new apigateway.LambdaIntegration(dynamoLambda), {
      authorizationScopes : [ "user-api-products/administration" ],
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      });
      product.addMethod('DELETE', new apigateway.LambdaIntegration(dynamoLambda), {
      authorizationScopes : [ "user-api-products/administration" ],
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      });
    
    const products = api.root.addResource('products');
      products.addMethod('GET', new apigateway.LambdaIntegration(dynamoLambda), {
      authorizationScopes : [ "user-api-products/administration" ],
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      });
  }
  
};