import { client } from "../client";

export interface SignupPayload {
  email: string;
  password: string;
}

export interface SignupResponse {
  id?: string;
  message?: string;
  email?: string;
}

export const signupApi = async (
  payload: SignupPayload,
): Promise<SignupResponse> => {
  const response = await client.post<SignupResponse>("/v1/users/signup/", {
    email: payload.email.trim(),
    password: payload.password,
  });
  return response.data;
};
