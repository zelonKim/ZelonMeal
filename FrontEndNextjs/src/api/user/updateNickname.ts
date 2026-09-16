import { client } from "../client";

export interface UpdateNicknamePayload {
  username: string;
}

export const updateNickname = async (newNickname: string) => {
  const response = await client.patch("/v1/users/profile/", {
    username: newNickname,
  });
  return response.data;
};