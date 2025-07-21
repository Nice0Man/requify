import { client } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";

export const getUserList = async () => {
  const response = await client.get(API_ENDPOINTS.USERS.LIST);
  return response.data;
};

export const getUser = async (id: string) => {
  const response = await client.get(API_ENDPOINTS.USERS.GET(id));
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await client.post(API_ENDPOINTS.USERS.CREATE, userData);
  return response.data;
};

export const updateUser = async (id: string, userData: any) => {
  const response = await client.put(API_ENDPOINTS.USERS.UPDATE(id), userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  await client.delete(API_ENDPOINTS.USERS.DELETE(id));
};
