'use strict';

const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const SQS = new SQSClient({
  region: process.env.AWS_REGION
});

module.exports.get = async event => {
  try {
    const payload = toMessage(event, process.env.SQS_HTTP_ARN);
    const messageCommand = new SendMessageCommand(payload);
    const acknowledgement = await SQS.send(messageCommand);
    return {
      statusCode: 200,
      body: JSON.stringify(acknowledgement)
    };
  } catch(exception) {
    return {
      statusCode: 500,
      body: JSON.stringify(exception)
    };
  }
};

function toMessage(httpRequest, queueUrl) {
  return {
    DelaySeconds: 0,
    MessageAttributes: {
      Resource: httpRequest.resource,
      Path: httpRequest.path,
      Method: httpRequest.httpMethod,
      Headers: httpRequest.headers,
      MultiValueHeaders: httpRequest.multiValueHeaders,
      QueryStringParameters: httpRequest.queryStringParameters,
      MultiValueQueryStringParameters: httpRequest.multiValueQueryStringParameters,
      PathParameters: httpRequest.pathParameters
    },
    MessageBody: httpRequest.body,
    QueueUrl: queueUrl
  };
}
