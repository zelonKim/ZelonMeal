import { UpdateProfilePayload } from "@/types/UpdateProfilePayload";
import { client } from "../client";

export const updateProfile = async (data: Record<string, string>) => {
  const payload: UpdateProfilePayload = {
    age: data.age ? parseInt(data.age, 10) : null,
    gender: data.gender,
    current_weight: data.current_weight
      ? parseFloat(data.current_weight)
      : null,
    goal_weight: data.goal_weight ? parseFloat(data.goal_weight) : null,
    purpose: data.purpose,
    meal_style: data.meal_style,
    disease: data.disease,
    allergies: data.allergies,
  };

  const response = await client.patch("/v1/users/profile/", payload);
  return response.data;
};
