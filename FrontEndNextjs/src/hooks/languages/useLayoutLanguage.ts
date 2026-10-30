"use client";

import { useSyncExternalStore } from "react";

const layoutTexts = {
  ko: {
    recommendedMeal: "AI 추천 식단",
    mealStats: "식단 통계",
    myPage: "마이페이지",
    logout: "로그아웃",
    confirmLogout: "정말 로그아웃 하시겠습니까?",
  },
  en: {
    recommendedMeal: "AI Meal Plan",
    mealStats: "Meal Stats",
    myPage: "My Page",
    logout: "Log Out",
    confirmLogout: "Are you sure you want to log out?",
  },
} as const;

type Locale = keyof typeof layoutTexts;

const emptySubscribe = () => () => {};

export function useLayoutLanguage() {
  const locale = useSyncExternalStore<Locale>(
    emptySubscribe,
    () => {
      const browserLang =
        navigator.language || (navigator.languages && navigator.languages[0]);
      return browserLang && !browserLang.toLowerCase().startsWith("ko")
        ? "en"
        : "ko";
    },
    () => "ko"
  );

  return { t: layoutTexts[locale], locale };
}