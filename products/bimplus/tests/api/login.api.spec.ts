import { test, expect } from "../../../../shared/fixtures/api.fixture";
import { AuthApi } from "../../api/authApi";

test.describe("Bimplus — Login API", () => {
  test("returns a valid session token", async ({ api }) => {
    const authApi = new AuthApi(api);
    const response = await authApi.login("testuser@example.com", "testpass");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("token");
  });

  test("rejects invalid credentials with 401", async ({ api }) => {
    const authApi = new AuthApi(api);
    const response = await authApi.login("testuser@example.com", "wrongpass");
    expect(response.status()).toBe(401);
  });
});
