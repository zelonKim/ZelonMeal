"use client";

import { useSyncExternalStore } from "react";

const myPageTexts = {
  ko: {
    noName: "이름 없음",
    suffixNim: "님",
    changeNickname: "닉네임 변경",
    noEmail: "이메일 정보 없음",
    loadingProfile: "유저 정보를 불러오고 있어요...",
    basicInfoTitle: "기본 신체 정보",
    ageLabel: "만 나이 (세)",
    genderLabel: "성별",
    currentWeightLabel: "현재 체중 (kg)",
    goalWeightLabel: "목표 체중 (kg)",
    purposeTitle: "식단 관리 목적",
    mealStyleTitle: "선호 식단 스타일",
    healthTitle: "건강 특이사항",
    diseaseLabel: "보유 질환 내역",
    diseasePlaceholder: "예: 고혈압, 당뇨 등",
    allergiesLabel: "알레르기 유발 유무",
    allergiesPlaceholder: "예: 복숭아, 견과류 등",
    saveButton: "프로필 저장하기",
    modalTitle: "✏️ 닉네임 변경",
    modalSubtitle: "ZelonMeal에서 사용할 새로운 닉네임을 입력해주세요.",
    modalPlaceholder: "닉네임 입력",
    cancel: "취소",
    complete: "변경 완료",
    alertEmptyNickname: "닉네임을 최소 한 글자 이상 채워주세요!",

    genders: {
      M: "남성",
      F: "여성",
    },

    purposes: {
      LOSS: "다이어트",
      MAINTAIN: "체중 유지",
      GAIN: "벌크업",
      HEALTH: "건강 관리",
    },

    mealStyles: {
      KOREAN: "한식 중심",
      WESTERN: "양식 중심",
      MIXED: "혼합",
    },
  },
  en: {
    noName: "No Name",
    suffixNim: "",
    changeNickname: "Change Nickname",
    noEmail: "No email information",
    loadingProfile: "Loading user information...",
    basicInfoTitle: "Basic Body Information",
    ageLabel: "Age (years)",
    genderLabel: "Gender",
    currentWeightLabel: "Current Weight (kg)",
    goalWeightLabel: "Goal Weight (kg)",
    purposeTitle: "Dietary Goal",
    mealStyleTitle: "Preferred Meal Style",
    healthTitle: "Health Details",
    diseaseLabel: "Medical Conditions",
    diseasePlaceholder: "e.g., Hypertension, Diabetes, etc.",
    allergiesLabel: "Allergies",
    allergiesPlaceholder: "e.g., Peaches, Nuts, etc.",
    saveButton: "Save Profile",
    modalTitle: "✏️ Change Nickname",
    modalSubtitle: "Please enter a new nickname to use on ZelonMeal.",
    modalPlaceholder: "Enter nickname",
    cancel: "Cancel",
    complete: "Complete",
    alertEmptyNickname:
      "Please enter at least one character for your nickname!",

    genders: {
      M: "Male",
      F: "Female",
    },

    purposes: {
      LOSS: "Weight Loss",
      MAINTAIN: "Maintain Weight",
      GAIN: "Bulking",
      HEALTH: "Health Care",
    },

    mealStyles: {
      KOREAN: "Korean Style",
      WESTERN: "Western Style",
      MIXED: "Mixed",
    },
  },
} as const;

type Locale = keyof typeof myPageTexts;

const emptySubscribe = () => () => {};

export function useMyPageLanguage() {
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

  return { t: myPageTexts[locale], locale };
}
