"use client";

import { useSyncExternalStore } from "react";

const signupTexts = {
  ko: {
    title: "식사하셨어요? 🥗",
    subtitle: "AI로부터 건강한 식단을 추천받아보세요!",
    emailPlaceholder: "이메일 주소",
    passwordPlaceholder: "비밀번호 (영문/숫자 조합 8자 이상)",
    passwordConfirmPlaceholder: "비밀번호 확인",
    startButton: "시작하기",
    hasAccount: "이미 계정이 있으신가요?",
    loginLink: "로그인",
    alertEmail: "올바른 이메일 형식이 아닙니다.",
    alertPassword: "비밀번호는 영문과 숫자를 조합하여 8자리 이상 입력해주세요.",
    alertPasswordMismatch: "비밀번호가 일치하지 않습니다.",
  },
  en: {
    title: "Have you eaten? 🥗",
    subtitle: "Get healthy meal recommendations from AI!",
    emailPlaceholder: "Email address",
    passwordPlaceholder: "Password (8+ chars, letters & numbers)",
    passwordConfirmPlaceholder: "Confirm password",
    startButton: "Get Started",
    hasAccount: "Already have an account?",
    loginLink: "Log In",
    alertEmail: "Please enter a valid email format.",
    alertPassword:
      "Password must be at least 8 characters with letters and numbers.",
    alertPasswordMismatch: "Passwords do not match.",
  },
} as const;

type Locale = keyof typeof signupTexts;

const emptySubscribe = () => () => {};

export function useSignupLanguage() {
  const locale = useSyncExternalStore<Locale>(
    emptySubscribe,
    () => {
      const browserLang =
        navigator.language || (navigator.languages && navigator.languages[0]);
      return browserLang && !browserLang.toLowerCase().startsWith("ko")
        ? "en"
        : "ko";
    },
    () => "ko",
  );

  return { t: signupTexts[locale], locale };
}
