import { SignupPayload } from "@/types/SignupPayload";
import { client } from "../client";
import { SignupResponse } from "@/types/SignupResponse";

export const signupApi = async (
  payload: SignupPayload,
): Promise<SignupResponse> => {
  const response = await client.post<SignupResponse>("/v1/users/signup/", {
    email: payload.email.trim(),
    password: payload.password,
  });
  return response.data;
};
