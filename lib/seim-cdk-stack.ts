import {
    CfnOutput,
    Duration,
    Stack,
    StackProps
} from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import {
    Code,
    Function,
    Runtime,
    FunctionUrlAuthType
} from 'aws-cdk-lib/aws-lambda';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';

export class SeimCdkStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Constructs are defined here

        // Simple Queue Service
        const queue = new Queue(this, 'SeimQueue', {
            visibilityTimeout: Duration.seconds(300)
        });

        // Simple Notification Service
        const topic = new Topic(this, 'SeimTopic');

        // Add subscription to topic
        topic.addSubscription(new SqsSubscription(queue));

        // Lambda function service
        const seimFunction = new Function(this, "SeimFunction", {
            runtime: Runtime.NODEJS_20_X, // Execution environment
            code: Code.fromAsset("lambda"), // Code location
            handler: "seim.handler", // File is "seim", function is "handler"
        });

        // Lambda function URL resource
        const seimFunctionUrl = seimFunction.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
        });

        // CloudFormation output for URL
        new CfnOutput(this, "seimFunctionUrlOutput", {
            value: seimFunctionUrl.url,
        });

        // Lambda function hit counter
        const seimHitCounter = new HitCounter(this, "SeimHitCounter", {
            downstream: seimFunction,
        });

        // Define API gateway REST API resource backed by Lambda function
        const gateway = new LambdaRestApi(this, "Endpoint", {
            handler: seimHitCounter.handler,
        });
    }
}