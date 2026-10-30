"use client";

import { useSyncExternalStore } from "react";

const loginTexts = {
  ko: {
    subtitle: "오늘의 건강한 한끼 식단",
    appDownload: "앱 다운로드",
    emailPlaceholder: "이메일을 입력해주세요",
    passwordPlaceholder: "비밀번호를 입력해주세요",
    loginButton: "로그인",
    noAccount: "아직 계정이 없으신가요?",
    signup: "회원가입",
    alertEmail: "이메일을 입력해주세요.",
    alertPassword: "비밀번호를 입력해주세요.",
  },
  en: {
    subtitle: "Today's Healthy Meal",
    appDownload: "App Download",
    emailPlaceholder: "Please enter your email",
    passwordPlaceholder: "Please enter your password",
    loginButton: "Log In",
    noAccount: "Don't have an account yet?",
    signup: "Sign Up",
    alertEmail: "Please enter your email.",
    alertPassword: "Please enter your password.",
  },
} as const; 

type Locale = keyof typeof loginTexts; 

const emptySubscribe = () => () => {};

export function useLoginLanguage() {
  const locale = useSyncExternalStore<Locale>(
    emptySubscribe,
    () => {
      const browserLang = navigator.language || (navigator.languages && navigator.languages[0]);
      return browserLang && !browserLang.toLowerCase().startsWith("ko") ? "en" : "ko";
    },
    () => "ko"
  );

  return { t: loginTexts[locale], locale };
}