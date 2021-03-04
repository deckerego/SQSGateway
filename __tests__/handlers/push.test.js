const { post } = require("../../handlers/push");
const uuid = require("uuid");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

jest.mock("uuid", () => {
  return {
    v4: () => "0000-0000-0000-0000"
  }
});

jest.mock("@aws-sdk/client-sqs", () => {
  const mockSQSClient = jest.fn().mockImplementation(() => {
    return { send: (message) => Promise.resolve(message) };
  });
  const mockSendMessageCommand = jest.fn().mockImplementation((payload) => {
    return payload;
  });
  return {
    SQSClient: mockSQSClient,
    SendMessageCommand: mockSendMessageCommand
  };
});

jest.mock("@aws-sdk/client-secrets-manager", () => {
  const mockSecretsManagerClient = jest.fn().mockImplementation(() => {
    return { send: (message) => Promise.resolve({ SecretString: "abc123" }) };
  });
  const mockSecretValueCommand = jest.fn().mockImplementation((params) => {
    return params;
  });
  return {
    SecretsManagerClient: mockSecretsManagerClient,
    GetSecretValueCommand: mockSecretValueCommand
  };
});

describe("submit", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Receive empty HTTP POST", async () => {
    const response = await post({body: '{"apikey": "abc123"}'}, {});
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      MessageAttributes: {
        AmazonCloudfrontId: { DataType: "String" },
        AmazonTraceId: { DataType: "String" },
        Host: { DataType: "String" },
        Method: { DataType: "String" },
        Path: { DataType: "String" },
        Resource: { DataType: "String" },
        UserAgent: { DataType: "String" },
      },
      MessageBody:'{}',
      MessageDeduplicationId: "0000-0000-0000-0000"
    });
  });

  test("Send the wrong API key", async () => {
    const response = await post({body: '{"apikey": "shoobeedoowah"}'}, {});
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body)).toEqual({});
  });
});
