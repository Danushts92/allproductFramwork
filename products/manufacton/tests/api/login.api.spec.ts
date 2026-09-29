import fs from "fs";
import { test, expect } from "../../../../shared/fixtures/api.fixture";
import { AuthApi } from "../../api/authApi";

const authFile = "shared/auth/storage/manufacton.json";

test.describe("Manufacton — Login API", () => {
  test.skip(
    !fs.existsSync(authFile),
    "Manufacton API login is not valid against the live stage app in this project; use the real authenticated session instead."
  );

  test("returns a valid session token", async ({ api }) => {
    const authApi = new AuthApi(api);
    const response = await authApi.login(
      process.env.SSO_USERNAME!,
      process.env.SSO_PASSWORD!
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("token");
  });

  test("rejects invalid credentials with 401", async ({ api }) => {
    const authApi = new AuthApi(api);
    const response = await authApi.login(
      process.env.SSO_USERNAME!,
      "wrongpass"
    );
    expect(response.status()).toBe(401);
  });
});
