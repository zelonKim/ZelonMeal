"use client";

import { useSyncExternalStore } from "react";

const dashboardTexts = {
  ko: {
    headerTitle: "오늘의 추천 식단",
    reRecommendButton: "식단 다시 추천받기",
    loadingGlobal: "AI가 맞춤 영양 식단을 설계하고 있어요...",
    loadingToday: "오늘의 추천 식단을 불러오고 있어요...",
    kcal: "kcal",
    carbs: "탄수화물",
    protein: "단백질",
    fat: "지방",
    recipeGuide: "조리법 가이드",
    recipePreparing: "레시피 정보 준비 중",
    zmartShop: "Z마트 장보기",
    emptyTitle: "오늘의 추천 식단이 아직 없어요",
    emptySubtitle:
      "최신 신체 정보와 식단 관리 목적을 분석하여\n완벽한 영양 성분 밸런스 식단을 설계해 드립니다.",
    recommendButton: "AI 맞춤 식단 설계받기",
    modalTitle: "식단 보완 요청",
    modalSubtitle:
      "현재 식단에서 보완하고 싶은 내용을 입력하면 AI가 다시 식단을 추천해줘요!",
    modalPlaceholder:
      "예: 오늘 저녁은 동물성 단백질이 아닌, 식물성 단백질 요리로 대체해줘!",
    cancel: "취소",
    submit: "입력 완료",
    alertLoadingProfile:
      "유저 프로필 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.",
    alertMissingFieldsTitle: "⚠️프로필 미입력",
    alertMissingFieldsGuide:
      "AI가 맞춤 식단을 설계할 수 있도록 마이페이지에서 다음 항목을 입력해주세요!",
    alertMissingFieldsRequired: "📍 필수 입력 항목:",
    alertFeedbackEmpty: "보완할 피드백 내용을 입력해주세요!",
  },
  en: {
    headerTitle: "Today's Meal Plan",
    reRecommendButton: "Get New Recommendations",
    loadingGlobal: "AI is designing your personalized nutrition meal plan...",
    loadingToday: "Loading today's recommended meal plan...",
    kcal: "kcal",
    carbs: "Carbs",
    protein: "Protein",
    fat: "Fat",
    recipeGuide: "Recipe Guide",
    recipePreparing: "Recipe info coming soon",
    zmartShop: "Shop at Z-Mart",
    emptyTitle: "No recommended meals for today yet",
    emptySubtitle:
      "We analyze your body info and dietary goals to design\nthe perfect balanced meal plan for you.",
    recommendButton: "Generate AI Meal Plan",
    modalTitle: "Request Meal Adjustment",
    modalSubtitle:
      "Tell AI what you'd like to adjust, and we'll create a revised meal plan for you!",
    modalPlaceholder:
      "e.g. Replace tonight's dinner with plant-based protein instead of animal protein!",
    cancel: "Cancel",
    submit: "Complete",
    alertLoadingProfile: "Loading profile info. Please try again in a moment.",
    alertMissingFieldsTitle: "⚠️ Missing Profile Info",
    alertMissingFieldsGuide:
      "Please complete the following items in My Page so the AI can design a personalized meal plan!",
    alertMissingFieldsRequired: "📍 Required fields:",
    alertFeedbackEmpty: "Please enter feedback for adjustments!",
  },
} as const;

type Locale = keyof typeof dashboardTexts;

const emptySubscribe = () => () => {};

export function useDashboardLanguage() {
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

  return { t: dashboardTexts[locale], locale };
}
