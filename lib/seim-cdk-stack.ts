import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class SeimCdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Constructs are defined here

        // Simple Queue Service
        const queue = new sqs.Queue(this, 'SeimQueue', {
            visibilityTimeout: cdk.Duration.seconds(300)
        });

        // Simple Notification Service
        const topic = new sns.Topic(this, 'SeimTopic');

        // Add subscription to topic
        topic.addSubscription(new subs.SqsSubscription(queue));

        // Lambda function service
        const seimFunction = new lambda.Function(this, "SeimFunction", {
            runtime: lambda.Runtime.NODEJS_20_X, // Execution environment
            code: lambda.Code.fromAsset("lambda"), // Code location
            handler: "seim.handler", // File is "seim", function is "handler"
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