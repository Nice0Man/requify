import { client } from "@/shared/api";
import { User } from "../model/types";

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await client.get("/users");
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await client.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await client.post("/users", userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await client.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await client.delete(`/users/${id}`);
  },
};
