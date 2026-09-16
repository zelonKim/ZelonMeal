export interface UserProfile {
  email: string;
  username: string;
  age: number;
  gender: string;
  current_weight: number;
  goal_weight: number;
  purpose: string;
  meal_style: string;
  disease?: string;
  allergies?: string;
  created_at: string;
}