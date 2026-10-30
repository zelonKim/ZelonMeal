"use client";

import { useSyncExternalStore } from "react";

const recommendMealTexts = {
  ko: {
    successAlert: "오늘의 맞춤 식단을 설계했습니다! 🥑",
    defaultError: "AI 식단을 생성하는 중 오류가 발생했습니다.",
    failPrefix: "추천 실패",
  },
  en: {
    successAlert: "Today's customized meal plan has been created! 🥑",
    defaultError: "An error occurred while generating the AI meal plan.",
    failPrefix: "Recommendation Failed",
  },
} as const;

type Locale = keyof typeof recommendMealTexts;

const emptySubscribe = () => () => {};

export function useRecommendMealLanguage() {
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

  return { t: recommendMealTexts[locale], locale };
}
