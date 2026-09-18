import { AxiosError } from "axios";
import { ApiErrorRes } from "@/types/ApiErrorRes";

export const getErrorMessage = (error: AxiosError<ApiErrorRes>, defaultMsg = "서버와 통신 중 오류가 발생했습니다."): string => {
  const serverError = error.response?.data;
  if (!serverError) return defaultMsg;

  const rawError =
    serverError.email ||
    serverError.password ||
    serverError.message ||
    serverError.detail;

  if (rawError) {
    return Array.isArray(rawError) ? rawError[0] : rawError;
  }

  return defaultMsg;
};