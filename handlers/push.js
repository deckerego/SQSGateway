'use strict';

const uuid = require("uuid");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const SQS = new SQSClient({
  region: process.env.AWS_REGION
});

module.exports.get = async event => {
  try {
    const payload = toMessage(event, process.env.SQS_HTTP_URL);
    const messageCommand = new SendMessageCommand(payload);
    console.log(JSON.stringify(messageCommand, null, 2));
    const acknowledgement = await SQS.send(messageCommand);
    return {
      statusCode: 200,
      body: JSON.stringify(acknowledgement)
    };
  } catch(exception) {
    console.error(exception);
    return {
      statusCode: 500,
      body: JSON.stringify(exception)
    };
  }
};

function toMessage(httpRequest, queueUrl) {
  return {
    MessageAttributes: {
      Resource: {
        DataType: "String",
        StringValue: httpRequest.resource
      },
      Path: {
        DataType: "String",
        StringValue: httpRequest.path
      },
      Method: {
        DataType: "String",
        StringValue: httpRequest.httpMethod
      },
      Host: {
        DataType: "String",
        StringValue: httpRequest.headers["Host"]
      },
      UserAgent: {
        DataType: "String",
        StringValue: httpRequest.headers["User-Agent"]
      },
      AmazonCloudfrontId: {
        DataType: "String",
        StringValue: httpRequest.headers["X-Amz-Cf-Id"]
      },
      AmazonTraceId: {
        DataType: "String",
        StringValue: httpRequest.headers["X-Amzn-Trace-Id"]
      }
    },
    MessageDeduplicationId: uuid.v4(),
    MessageGroupId: process.env.AWS_LAMBDA_FUNCTION_NAME,
    MessageBody: httpRequest.body || "{}",
    QueueUrl: queueUrl
  };
}
