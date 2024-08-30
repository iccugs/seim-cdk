import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class SeimCdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Constructs are defined here

        // Lambda function service
        const seimFunction = new lambda.Function(this, "SeimFunction", {
            runtime: lambda.Runtime.PYTHON_3_12, // Execution environment
            handler: "index.handler",
            code: lambda.Code.fromInline(`
                exports.handler = async function(event) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify("Seim Test Lambda Function"),
                    };
                };
            `),
        });
    }
}