class LambdaEventBuilder {
  constructor() {
    this.queryStringParameters = {};
    this.body = "";
  }

  withQueryStringParameter(name, value) {
    this.queryStringParameters[name] = value;
    return this;
  }

  withBody(body) {
    this.body = body;
    return this;
  }

  build() {
    return {
      queryStringParameters: this.queryStringParameters,
      body: this.body
    };
  }
}

module.exports = LambdaEventBuilder;
