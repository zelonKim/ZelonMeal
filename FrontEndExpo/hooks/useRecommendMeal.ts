import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { recommendMeal } from "@/api/meal/recommendMeal";
import { TODAY_STR } from "@/constants/todayString";

export const useRecommendMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recommendMeal,
    onSuccess: (data) => {
      queryClient.setQueryData(["todayMealPlan"], data);
      queryClient.invalidateQueries({ queryKey: ["dailyStats", TODAY_STR] });
      alert("오늘의 맞춤 식단을 설계했습니다! 🥑");
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      const errorMsg =
        error.response?.data?.detail ||
        "AI 식단을 생성하는 중 오류가 발생했습니다.";
      alert(`추천 실패: ${errorMsg}`);
    },
  });
};
