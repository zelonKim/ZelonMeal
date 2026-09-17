import { MenuNameItem } from "./MenuNameItem";

export interface DailyStatResponse {
  date: string;
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  menu_names: MenuNameItem[];
}
