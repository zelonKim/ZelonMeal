import { MealItem } from "./MealItem";

export interface TodayMealPlanResponse {
  id: number | null;
  date?: string;
  menu_list: MealItem[];
}
