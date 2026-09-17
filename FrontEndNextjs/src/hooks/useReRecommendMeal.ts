import { reRecommendMeal } from "@/api/meal/reRecommendMeal";
import { TODAY_STR } from "@/constants/todayStr";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface UseReRecommendMealOptions {
  onSuccessCallback?: () => void;
}

export const useReRecommendMeal = ({
  onSuccessCallback,
}: UseReRecommendMealOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedback: string) => reRecommendMeal(feedback),
    onSuccess: (response) => {
      queryClient.setQueryData(["todayMealPlan"], response.data);
      queryClient.invalidateQueries({ queryKey: ["dailyStats", TODAY_STR] });

      alert("피드백을 반영하여 오늘의 맞춤 식단을 재구성하였습니다! 🥗");

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      const errorMsg =
        error.response?.data?.detail || "재추천 중 문제가 발생했습니다.";
      alert(`재추천 실패: ${errorMsg}`);
    },
  });
};
