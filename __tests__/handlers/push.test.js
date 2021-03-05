const { post } = require("../../handlers/push");
const uuid = require("uuid");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const LambdaEventBuilder = require("../helpers/LambdaEventBuilder");

jest.mock("uuid", () => {
  return {
    v4: () => "0000-0000-0000-0000"
  }
});

jest.mock("@aws-sdk/client-sqs", () => {
  const mockSQSClient = jest.fn().mockImplementation(() => {
    return { send: (message) => Promise.resolve({ MessageId: "feedface123" }) };
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

  test("Receive authorized HTTP POST", async () => {
    const httpMessage = new LambdaEventBuilder()
      .withBody("")
      .withQueryStringParameter("apikey", "abc123")
      .build();
    const response = await post(httpMessage, {});

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ MessageId: "feedface123" });
  });

  test("Send the wrong API key", async () => {
    const httpMessage = new LambdaEventBuilder()
      .withBody("")
      .withQueryStringParameter("apikey", "shoobeedoowah")
      .build();
    const response = await post(httpMessage, {});

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body)).toEqual({});
  });

  test("Send an empty payload", async () => {
    const httpMessage = new LambdaEventBuilder().build();
    const response = await post(httpMessage, {});

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body)).toEqual({});
  });
});
