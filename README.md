# SQS HTTP Gateway

A simple API Gateway in AWS that stores inbound HTTPS calls as SQS FIFO messages for asynchronous remote retrieval. If you need a way to get HTTP requests to a resource behind a firewall or NAT gateway, this might work.


## Deploying the Gateway

The gateway exists as a Serverless project with AWS-specific resources. Once you have your API keys for an AWS account, the gateway can be deployed with:

    npm install
    serverless deploy -v --aws-profile <PROFILE>


## Retrieving HTTP Requests

A sample Node.JS script is located in the `/scripts` directory as an example of how you could subscribe to the SQS queue receiving inbound requests. The remote gateway would intercept the request, store the contents as an SQS message, and then allow subscribers polling the queue to fetch them.
