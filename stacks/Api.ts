import { StackContext, Api, EventBus, Config } from "sst/constructs";

export function API({ stack }: StackContext) {
    const DB_URL = new Config.Secret(stack, "DB_URL")

    const api = new Api(stack, "api", {
        defaults: {
            function: {
                bind: [DB_URL]
            },
        },
        cors: {
            allowOrigins: ["*"],
            allowMethods: ["ANY"],
        },
        routes: {
            "POST /pull": {
                function: {
                    handler: "packages/functions/lambdas/pull/pull.go",
                    runtime: "go"
                }
            },
            "POST /push": {
                function: {
                    handler: "packages/functions/lambdas/push/push.go",
                    runtime: "go"
                }
            },
            "GET /": "packages/functions/src/lambda.handler",
            "GET /trpc/{proxy+}": "packages/functions/src/api.handler",
            "POST /trpc/{proxy+}": "packages/functions/src/api.handler",
            "GET /todo": "packages/functions/src/todo.list",
            "POST /todo": "packages/functions/src/todo.create",
        },
    });

    stack.addOutputs({
        ApiEndpoint: api.url,
    });
    return { api }
}
