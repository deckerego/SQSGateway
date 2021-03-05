const uuid = require("uuid");

class SQSMessageBuilder {
  constructor() {
    this.headers = {};
    this.body = "";
  }

  withBody(body) {
    this.body = body;
    return this;
  }

  withHeader(name, value) {
    this.headers[name] = value;
    return this;
  }

  build() {
    return {
      MessageAttributes: {
        Resource: {
          DataType: "String",
          StringValue: this.resource
        },
        Path: {
          DataType: "String",
          StringValue: this.path
        },
        Method: {
          DataType: "String",
          StringValue: this.httpMethod
        },
        Host: {
          DataType: "String",
          StringValue: this.headers ? this.headers["Host"] : undefined
        },
        UserAgent: {
          DataType: "String",
          StringValue: this.headers ? this.headers["User-Agent"] : undefined
        },
        AmazonCloudfrontId: {
          DataType: "String",
          StringValue: this.headers ? this.headers["X-Amz-Cf-Id"] : undefined
        },
        AmazonTraceId: {
          DataType: "String",
          StringValue: this.headers ? this.headers["X-Amzn-Trace-Id"] : undefined
        }
      },
      MessageDeduplicationId: uuid.v4(),
      MessageGroupId: this.groupId,
      MessageBody: this.body,
      QueueUrl: this.queueUrl
    };
  }
}

module.exports = SQSMessageBuilder;
