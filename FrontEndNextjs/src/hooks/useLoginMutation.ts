import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { loginApi } from "@/api/auth/loginApi";
import { AxiosError } from "axios";
import { ApiErrorRes } from "@/types/ApiErrorRes";

export const useLoginMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      try {
        Cookies.set("userToken", data.access, { expires: 1 });
        Cookies.set("refreshToken", data.refresh, { expires: 7 });
        router.replace("/");
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
