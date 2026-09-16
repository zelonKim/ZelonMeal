import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { updateNickname } from "@/api/user/updateNickname";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface UseUpdateNicknameMutationOptions {
  onSuccessCallback?: () => void;
}

export const useUpdateNicknameMutation = (
  options?: UseUpdateNicknameMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNickname,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      alert("닉네임이 성공적으로 변경되었습니다.");
      options?.onSuccessCallback?.();
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      // getErrorMessage 유틸을 활용하여 username 에러 및 기본 에러를 일관되게 추출
      const errorMessage =
        error.response?.data?.username?.[0] ||
        getErrorMessage(error, "닉네임 변경 중 오류가 발생했습니다.");
      alert(errorMessage);
    },
  });
};
