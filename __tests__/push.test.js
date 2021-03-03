const { get } = require("../handlers/push");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

jest.mock("@aws-sdk/client-sqs", () => {
  const mockSQSClient = jest.fn().mockImplementation(() => {
    return { send: (message) => message };
  });
  const mockSendMessageCommand = jest.fn().mockImplementation((payload) => {
    return payload;
  });
  return {
    SQSClient: mockSQSClient,
    SendMessageCommand: mockSendMessageCommand
  };
});

describe("push", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Receive empty HTTP GET", async () => {
    const response = await get({}, {});
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      DelaySeconds: 0,
      MessageAttributes:{}
    });
  });
});
