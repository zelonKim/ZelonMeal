import { client } from "../client";
import { MealItem } from "@/types/MealItem";

export const recommendMeal = async (): Promise<MealItem> => {
  const { data } = await client.post("/v1/meals/recommend/");
  return data;
};
