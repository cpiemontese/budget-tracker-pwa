import { createMocks } from "node-mocks-http";
import { signup } from "./signup";

test("returns 400 if body is not as expected", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: null,
  });

  req.transporter = {
    async sendMail() {},
  };

  req.logger = {
    debug() {},
    error() {},
  };

  const response = await signup(req, res);

  expect(response.statusCode).toEqual(400);
});
