import { apiClient, ApiResponse } from '@/shared/api/client';
import { User, UserProfile, UserCreate } from '../types/auth.types';

export interface UserListParams {
  skip?: number;
  limit?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface UserUpdateRequest {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  department?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  is_active?: boolean;
}

export class UsersApi {
  constructor(private client = apiClient) {}

  // 1. Get Users (with pagination, filtering, searching)
  async getUsers(params?: UserListParams): Promise<ApiResponse<UserListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString ? `/users/?${queryString}` : '/users/';
    
    return this.client.get<UserListResponse>(url);
  }

  // 2. Create User (admin only)
  async createUser(userData: UserCreate): Promise<ApiResponse<UserProfile>> {
    return this.client.post<UserProfile>('/users/', userData);
  }

  // 3. Get Current User Info
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.client.get<UserProfile>('/users/me');
  }

  // 4. Update Current User
  async updateCurrentUser(userData: UserUpdateRequest): Promise<ApiResponse<UserProfile>> {
    return this.client.put<UserProfile>('/users/me', userData);
  }

  // 5. Get User by ID
  async getUser(userId: number): Promise<ApiResponse<UserProfile>> {
    return this.client.get<UserProfile>(`/users/${userId}`);
  }

  // 6. Update User (admin only)
  async updateUser(userId: number, userData: UserUpdateRequest): Promise<ApiResponse<UserProfile>> {
    return this.client.put<UserProfile>(`/users/${userId}`, userData);
  }

  // 7. Delete User (admin only)
  async deleteUser(userId: number): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/users/${userId}`);
  }

  // 8. Activate User (admin only)
  async activateUser(userId: number): Promise<ApiResponse<UserProfile>> {
    return this.client.post<UserProfile>(`/users/${userId}/activate`, {});
  }

  // 9. Deactivate User (admin only)
  async deactivateUser(userId: number): Promise<ApiResponse<UserProfile>> {
    return this.client.post<UserProfile>(`/users/${userId}/deactivate`, {});
  }
}

// Export singleton instance
export const usersApi = new UsersApi(); 