import { client } from "../../../shared/api/client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await client.post("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await client.post("/auth/register", data);
    return response.data;
  },

  async logout(): Promise<void> {
    await client.post("/auth/logout");
  },

  async getMe(): Promise<LoginResponse["user"]> {
    const response = await client.get("/auth/me");
    return response.data;
  },

  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    const response = await client.post("/auth/refresh", {
      refreshToken: data.refreshToken,
    });
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await client.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await client.post("/auth/reset-password", { token, password });
  },
};
