"use client";

import { useSyncExternalStore } from "react";

const statTexts = {
  ko: {
    todayButton: "오늘",
    loadingStat: "날짜별 통계 데이터를 불러오고 있어요...",
    nutritionTitle: "영양성분 섭취 총량",
    totalCalories: "TOTAL CALORIES",
    totalCaloriesDesc: "일일 총 섭취 칼로리",
    kcal: "kcal",
    carbsLabel: "탄수화물",
    proteinLabel: "단백질",
    fatLabel: "지방",
    basedOn: "기준",
    guideNotice:
      "최신 신체 정보 기준 일일 섭취 밸런스 매트릭스 가이드라인입니다.",
    mealRecordTitle: "식단 기록",
    emptyMealRecord: "해당 날짜에 추천받은 식단이 없습니다.",
  },
  en: {
    todayButton: "Today",
    loadingStat: "Loading daily statistics data...",
    nutritionTitle: "Total Nutrient Intake",
    totalCalories: "TOTAL CALORIES",
    totalCaloriesDesc: "Total daily calories consumed",
    kcal: "kcal",
    carbsLabel: "Carbs",
    proteinLabel: "Protein",
    fatLabel: "Fat",
    basedOn: "based",
    guideNotice:
      "Daily intake balance matrix guideline based on the latest body info.",
    mealRecordTitle: "Meal Records",
    emptyMealRecord: "No recommended meals found for this date.",
  },
} as const;

type Locale = keyof typeof statTexts;

const emptySubscribe = () => () => {};

export function useStatLanguage() {
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

  return { t: statTexts[locale], locale };
}
