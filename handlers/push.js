'use strict';

const uuid = require("uuid");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const SQS = new SQSClient({
  region: process.env.AWS_REGION
});

const SecretsManager = new SecretsManagerClient({
  region: process.env.AWS_REGION
});

module.exports.post = async event => {
  try {
    const acknowledgement = await sendSQSMessage(event);
    const apiKey = await getApiKey();
    const body = JSON.parse(event.body);

    if(apiKey.SecretString != body.apikey) {
      return {
        statusCode: 403,
        body:  JSON.stringify({})
      }
    }

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

function getApiKey() {
  const params = {
    SecretId: process.env.API_KEY_ARN
  };
  const getValueCommand = new GetSecretValueCommand(params);
  return SecretsManager.send(getValueCommand);
}

function sendSQSMessage(event) {
  const payload = toMessage(event, process.env.SQS_HTTP_URL);
  const messageCommand = new SendMessageCommand(payload);
  return SQS.send(messageCommand);
}

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
        StringValue: httpRequest.headers ? httpRequest.headers["Host"] : undefined
      },
      UserAgent: {
        DataType: "String",
        StringValue: httpRequest.headers ? httpRequest.headers["User-Agent"] : undefined
      },
      AmazonCloudfrontId: {
        DataType: "String",
        StringValue: httpRequest.headers ? httpRequest.headers["X-Amz-Cf-Id"] : undefined
      },
      AmazonTraceId: {
        DataType: "String",
        StringValue: httpRequest.headers ? httpRequest.headers["X-Amzn-Trace-Id"] : undefined
      }
    },
    MessageDeduplicationId: uuid.v4(),
    MessageGroupId: process.env.AWS_LAMBDA_FUNCTION_NAME,
    MessageBody: httpRequest.body || "{}",
    QueueUrl: queueUrl
  };
}
