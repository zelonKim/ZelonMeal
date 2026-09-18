import { client } from "../client";
import { TodayMealPlanResponse } from "@/types/TodayMealPlanResponse";

export const getTodayMealPlan = async (): Promise<TodayMealPlanResponse> => {
  const { data } = await client.get("/v1/meals/today/");
  return data;
};
