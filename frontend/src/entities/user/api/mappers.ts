import { User, UserRole } from "../model/types";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const mapUserDtoToUser = (dto: UserDTO): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  role: dto.role as UserRole,
  isActive: true,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const mapUserToUserDto = (user: User): Partial<UserDTO> => ({
  name: user.name,
  email: user.email,
  role: user.role,
});
