import { ApiClient } from "../../../shared/utils/apiClient";

export class AuthApi {
  constructor(private client: ApiClient) {}

  async login(username: string, password: string) {
    return this.client.post("/api/auth/login", { username, password });
  }

  async getCurrentUser(token: string) {
    return this.client.withToken(token).get("/api/auth/me");
  }
}
