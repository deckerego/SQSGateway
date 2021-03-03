const { get } = require("../handlers/push");

describe("push", () => {
  test("Receive HTTP GET", async () => {
    const event = { testKey: "testValue" };
    const response = await get(event, {});
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("{\"testKey\":\"testValue\"}");
  });
});
