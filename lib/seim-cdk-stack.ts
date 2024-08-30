import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class SeimCdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Constructs are defined here

        // Lambda function service
        const seimFunction = new lambda.Function(this, "SeimFunction", {
            runtime: lambda.Runtime.NODEJS_20_X, // Execution environment
            handler: "index.handler",
            code: lambda.Code.fromInline(`
                exports.handler = async function(event) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify('Seim Test Lambda Function'),
                    };
                };
            `),
        });

        // Lambda function URL resource
        const seimFunctionUrl = seimFunction.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
        });

        // CloudFormation output for URL
        new cdk.CfnOutput(this, "seimFunctionUrlOutput", {
            value: seimFunctionUrl.url,
        });
    }
}