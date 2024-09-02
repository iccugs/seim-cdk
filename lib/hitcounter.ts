import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
    Code,
    Function,
    IFunction,
    Runtime
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface HitCounterProps {
    // The function for which we want to count url hits
    downstream: IFunction;
}

export class HitCounter extends Construct {
    // Allows the counter function to be accessed outside of the class
    public readonly handler: Function;

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new Table(this, "Hits", {
            partitionKey: { name: "path", type: AttributeType.STRING },
        });

        this.handler = new Function(this, "HitCounterHandler", {
            runtime: Runtime.NODEJS_20_X,
            handler: "hitcounter.handler",
            code: Code.fromAsset("lambda"),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName,
            },
        });

        // Grant the lambda role read/write permissions to the table
        table.grantReadWriteData(this.handler);

        // Grant the lambda role invoke permissions to the downstream function
        props.downstream.grantInvoke(this.handler);
    }
}