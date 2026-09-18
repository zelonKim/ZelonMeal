import { DailyStatResponse } from "@/types/DailyStatResponse";
import { client } from "../client";

export const getMealStats = async (
  date: string,
): Promise<DailyStatResponse> => {
  const { data } = await client.get(`/v1/meals/stats/?date=${date}`);
  return data;
};
