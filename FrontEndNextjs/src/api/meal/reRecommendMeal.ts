import { client } from "../client";
import { ReRecommendResponse } from "@/types/ReRecommendResponse";

export const reRecommendMeal = async (
  feedback: string,
): Promise<ReRecommendResponse> => {
  const { data } = await client.post("/v1/meals/rerecommend/", {
    user_feedback: feedback,
  });
  return data;
};
