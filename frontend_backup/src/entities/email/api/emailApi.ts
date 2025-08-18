import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";

const emailApi = {
  subscribe: async (email: string) => {
    const response = await client.post(API_ENDPOINTS.EMAIL.SUBSCRIBE, {
      email,
    });
    return response.data;
  },
};

export default emailApi;
