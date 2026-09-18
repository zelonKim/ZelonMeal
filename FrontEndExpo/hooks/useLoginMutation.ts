import { useMutation } from "@tanstack/react-query";

import { loginApi } from "@/api/auth/loginApi";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { AxiosError } from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      try {
        await SecureStore.setItemAsync("userToken", data.access);
        await SecureStore.setItemAsync("refreshToken", data.refresh);
        router.replace("/(screen)");
      } catch (err) {
        console.log(err);
        alert("인증 정보를 저장하는 중 오류가 발생했습니다.");
      }
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      const serverError = error.response?.data;
      let errorMessage = "이메일 혹은 비밀번호가 틀렸습니다.";

      if (serverError?.detail) {
        errorMessage = serverError.detail;
        if (errorMessage.includes("No active account")) {
          errorMessage = "이메일 혹은 비밀번호가 틀렸습니다.";
        }
      }
      alert(errorMessage);
    },
  });
};
