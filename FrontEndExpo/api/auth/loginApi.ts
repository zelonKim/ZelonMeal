import { LoginPayload } from "@/types/LoginPayload";
import { client } from "../client";
import { LoginResponse } from "@/types/LoginResponse";

export const loginApi = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response = await client.post<LoginResponse>("/v1/users/login/", {
    email: payload.email.trim(),
    password: payload.password,
  });
  return response.data;
};
