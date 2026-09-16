import { client } from "../client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const loginApi = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response = await client.post<LoginResponse>("/v1/users/login/", {
    email: payload.email.trim(),
    password: payload.password,
  });
  return response.data;
};
