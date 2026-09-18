import { UserProfile } from "@/types/UserProfile";
import { client } from "../client";

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await client.get<UserProfile>("/v1/users/profile/");
  return response.data;
};


