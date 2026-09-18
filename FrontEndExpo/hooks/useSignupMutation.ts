import { useMutation } from "@tanstack/react-query";

import { signupApi } from "@/api/auth/signupApi";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { AxiosError } from "axios";
import { router } from "expo-router";

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: signupApi,
    onSuccess: (data) => {
      alert(data.message || "회원가입이 정상적으로 완료되었습니다.");
      router.replace("/login");
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      console.error("백엔드 통신 에러 발생 로그:", error);
      alert(getErrorMessage(error));
    },
  });
};
