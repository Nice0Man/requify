import { User, UserRole } from "../model/types";

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const mapUserDtoToUser = (dto: UserDTO): User => ({
  id: dto.id,
  email: dto.email,
  role: dto.role as UserRole,
  username: dto.name,
  created_at: dto.created_at,
  updated_at: dto.updated_at,
  is_active: true,
  email_verified: false,
});

export const mapUserToUserDto = (user: User): Partial<UserDTO> => ({
  id: user.id,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at,
});
