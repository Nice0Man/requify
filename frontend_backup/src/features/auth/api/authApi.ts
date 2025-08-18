import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";

// === Базовые типы для аутентификации ===

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name?: string;
  email: string;
  password: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: string; // Обязательное поле согласно схеме бэкенда
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  // Для обратной совместимости
  token?: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirmRequest {
  token: string;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user?: LoginResponse["user"];
}

export interface UserSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  lastUsed: string;
  isActive: boolean;
}

export interface Auth0StatusResponse {
  enabled: boolean;
  domain: string | null;
  audience: string | null;
}

export interface Auth0UserInfo {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  [key: string]: any;
}

// === Auth API ===

export const authApi = {
  // === Основная аутентификация ===

  async login(data: LoginRequest): Promise<LoginResponse> {
    // OAuth2 API ожидает form data, не JSON
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const response = await client.post(API_ENDPOINTS.AUTH.LOGIN, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await client.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  async logout(): Promise<void> {
    // Получаем refresh_token для отправки на сервер для аннулирования
    const refreshToken = localStorage.getItem('refresh_token');
    const payload = refreshToken ? { refresh_token: refreshToken } : {};
    
    await client.post(API_ENDPOINTS.AUTH.LOGOUT, payload);
  },

  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    const response = await client.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: data.refreshToken,  // Используем snake_case как ожидает backend
    });
    return response.data;
  },

  async validateToken(
    data: ValidateTokenRequest
  ): Promise<ValidateTokenResponse> {
    const response = await client.post(API_ENDPOINTS.AUTH.VALIDATE_TOKEN, data);
    return response.data;
  },

  // === Управление паролем ===

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await client.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await client.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  async confirmResetPassword(data: ResetPasswordConfirmRequest): Promise<void> {
    await client.post(API_ENDPOINTS.AUTH.RESET_PASSWORD_CONFIRM, data);
  },

  // === Верификация email ===

  async requestEmailVerification(
    data: EmailVerificationRequest
  ): Promise<void> {
    await client.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL_REQUEST, data);
  },

  async confirmEmailVerification(
    data: EmailVerificationConfirmRequest
  ): Promise<void> {
    await client.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL_CONFIRM, data);
  },

  // === Управление сессиями ===

  async getUserSessions(): Promise<UserSession[]> {
    const response = await client.get(API_ENDPOINTS.AUTH.SESSIONS);
    return response.data;
  },

  async revokeSessions(sessionIds?: string[]): Promise<void> {
    await client.post(API_ENDPOINTS.AUTH.SESSIONS_REVOKE, { sessionIds });
  },

  // === Auth0 OAuth2 ===

  async auth0Callback(code: string, state?: string): Promise<LoginResponse> {
    const response = await client.post(API_ENDPOINTS.AUTH.OAUTH2_AUTH0, {
      code,
      state,
    });
    return response.data;
  },

  async getAuth0UserInfo(): Promise<Auth0UserInfo> {
    const response = await client.get(API_ENDPOINTS.AUTH.OAUTH2_AUTH0_USERINFO);
    return response.data;
  },

  async getAuth0Status(): Promise<Auth0StatusResponse> {
    const response = await client.get(API_ENDPOINTS.AUTH.OAUTH2_AUTH0_STATUS);
    return response.data;
  },

  // === Информация о пользователе ===

  async getMe(): Promise<LoginResponse["user"]> {
    const response = await client.get(API_ENDPOINTS.USERS.ME.ROOT);
    return response.data;
  },

  async updateMe(
    userData: Partial<LoginResponse["user"]>
  ): Promise<LoginResponse["user"]> {
    const response = await client.put(API_ENDPOINTS.USERS.ME.UPDATE, userData);
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await client.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },
};
