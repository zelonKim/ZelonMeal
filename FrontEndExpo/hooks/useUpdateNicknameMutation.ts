import { updateNickname } from "@/api/user/updateNickname";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

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
      const errorMessage =
        error.response?.data?.username?.[0] ||
        getErrorMessage(error, "닉네임 변경 중 오류가 발생했습니다.");
      alert(errorMessage);
    },
  });
};
