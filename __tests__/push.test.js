const { get } = require("../handlers/push");
const uuid = require("uuid");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

jest.mock("uuid", () => {
  return {
    v4: () => "0000-0000-0000-0000"
  }
});

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
      MessageAttributes:{},
      MessageBody:"{}",
      MessageDeduplicationId: "0000-0000-0000-0000"
    });
  });
});
