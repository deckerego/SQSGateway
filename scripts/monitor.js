const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const AWS_REGION = process.argv[2];
const SQS_HTTP_URL = process.argv[3];
const SQS = new SQSClient({ region: AWS_REGION });

async function fetchMessages(callback) {
  try {
    const data = await receiveAll();
    if(data.Messages) {
      data.Messages.forEach(callback);
      await deleteAll(data.Messages);
    }
  } catch(exception) {
    console.error(exception);
  }
};

function receiveAll() {
  const receiveCommand = new ReceiveMessageCommand({
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: ["All"],
    QueueUrl: SQS_HTTP_URL,
    WaitTimeSeconds: 20,
  });
  return SQS.send(receiveCommand);
}

function deleteAll(messages) {
  const deleteCommands = messages.map(message =>
    new DeleteMessageCommand({
      QueueUrl: SQS_HTTP_URL,
      ReceiptHandle: message.ReceiptHandle,
    })
  );

  return Promise.all(deleteCommands.map(command => SQS.send(command)));
}

function logMessage(message) {
  console.log(JSON.stringify(message, null, 2));
}

(async () => {
  if(! SQS_HTTP_URL) {
    console.error("Arguments: AWS_REGION SQS_HTTP_URL")
    return null;
  }

  setInterval(() => fetchMessages(logMessage), 30000);
})();
