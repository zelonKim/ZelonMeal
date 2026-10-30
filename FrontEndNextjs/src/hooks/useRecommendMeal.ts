import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { recommendMeal } from "@/api/meal/recommendMeal";
import { TODAY_STR } from "@/constants/todayStr";
import { useRecommendMealLanguage } from "./languages/useRecommendMealLanguage";

export const useRecommendMeal = () => {
  const queryClient = useQueryClient();
  const { t } = useRecommendMealLanguage();

  return useMutation({
    mutationFn: recommendMeal,
    onSuccess: (data) => {
      queryClient.setQueryData(["todayMealPlan"], data);
      queryClient.invalidateQueries({ queryKey: ["dailyStats", TODAY_STR] });
      alert(t.successAlert);
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      const errorMsg = error.response?.data?.detail || t.defaultError;
      alert(`${t.failPrefix}: ${errorMsg}`);
    },
  });
};
