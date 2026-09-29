import { ApiClient } from "../../../shared/utils/apiClient";

export class AuthApi {
  constructor(private client: ApiClient) {}

  async login(email: string, password: string) {
    return this.client.post("/v2/session/create", { email, password });
  }

  async getCurrentUser(token: string) {
    return this.client.withToken(token).get("/v2/session/me");
  }
}
