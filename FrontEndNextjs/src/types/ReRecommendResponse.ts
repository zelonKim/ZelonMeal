import { TodayMealPlanResponse } from "./TodayMealPlanResponse";

export interface ReRecommendResponse {
  data: TodayMealPlanResponse;
  message?: string;
}
