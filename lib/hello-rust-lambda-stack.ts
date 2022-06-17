import { join } from "path";

import { CfnOutput, DockerImage, Stack, StackProps } from "aws-cdk-lib";
import {
  Code,
  Function,
  Runtime,
  FunctionUrlAuthType,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class HelloRustLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const target = "x86_64-unknown-linux-musl";

    const helloCustomEvent = new Function(this, "HelloCustomEventHandler", {
      code: Code.fromAsset(join(__dirname, "../lambda/hello-custom-event"), {
        bundling: {
          image: DockerImage.fromRegistry("rust:1-slim"),
          command: [
            "bash",
            "-c",
            `rustup target add ${target} && cargo build --release --target ${target} && cp target/${target}/release/hello-custom-event /asset-output/bootstrap`,
          ],
        },
      }),
      functionName: "hello-rust-lambda-hello-custom-event",
      handler: "main",
      runtime: Runtime.PROVIDED_AL2,
      memorySize: 128,
    });

    const helloHttpEvent = new Function(this, "HelloHttpEventHandler", {
      code: Code.fromAsset(join(__dirname, "../lambda/hello-http-event"), {
        bundling: {
          image: DockerImage.fromRegistry("rust:1-slim"),
          command: [
            "bash",
            "-c",
            `rustup target add ${target} && cargo build --release --target ${target} && cp target/${target}/release/hello-http-event /asset-output/bootstrap`,
          ],
        },
      }),
      functionName: "hello-rust-lambda-hello-http-event",
      handler: "main",
      runtime: Runtime.PROVIDED_AL2,
      memorySize: 128,
    });

    const helloHttpEventFnURL = helloHttpEvent.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, "HelloHttpEventHandlerFunctionURL", {
      value: helloHttpEventFnURL.url,
    });
  }
}
