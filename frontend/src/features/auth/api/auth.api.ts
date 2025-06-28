import { ApiClient, ApiResponse } from '@/shared/api/client';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  SessionListResponse,
  RevokeSessionRequest,
  UserProfile,
  UserCreate,
  LogoutRequest,
  LogoutResponse,
  TokenValidationRequest,
  TokenValidationResponse
} from '../types/auth.types';

export class AuthApi {
  constructor(private client: ApiClient) {}

  // 1. Register User
  async register(userData: UserCreate): Promise<ApiResponse<UserProfile>> {
    return this.client.post<UserProfile>('/auth/register', userData);
  }

  // 2. Login for Access Token
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    formData.append('grant_type', 'password');
    
    return this.client.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  // 3. Refresh Token
  async refreshToken(request: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.client.post<RefreshTokenResponse>('/auth/refresh', request);
  }

  // 4. Logout
  async logout(request: LogoutRequest): Promise<ApiResponse<LogoutResponse>> {
    return this.client.post<LogoutResponse>('/auth/logout', request);
  }

  // 5. Validate Token
  async validateToken(request: TokenValidationRequest): Promise<ApiResponse<TokenValidationResponse>> {
    return this.client.post<TokenValidationResponse>('/auth/validate-token', request);
  }

  // 6. Change Password
  async changePassword(request: PasswordChangeRequest): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>('/auth/change-password', request);
  }

  // 7. Request Password Reset
  async requestPasswordReset(request: PasswordResetRequest): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>('/auth/reset-password', request);
  }

  // 8. Confirm Password Reset
  async confirmPasswordReset(request: PasswordResetConfirm): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>('/auth/reset-password/confirm', request);
  }

  // 9. Get User Sessions
  async getSessions(): Promise<ApiResponse<SessionListResponse>> {
    return this.client.get<SessionListResponse>('/auth/sessions');
  }

  // 10. Revoke Sessions
  async revokeSession(request: RevokeSessionRequest): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>('/auth/sessions/revoke', request);
  }
}

// Export singleton instance
export const authApi = new AuthApi(new ApiClient()); 