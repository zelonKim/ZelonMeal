"use client";

import { useSyncExternalStore } from "react";

const modalTexts = {
  ko: {
    title: "ZelonMeal 앱 다운로드",
    subtitle: "QR 코드를 스캔하여 앱을 설치해 보세요",
    androidTab: "Android",
    iosTab: "iOS",
    qrReadying: "QR 준비 중",
    platforms: {
      android: {
        guideTitle: "Android 설치 가이드",
        guideSteps:
          "기본 카메라나 QR 스캐너 앱으로 코드를 비추어 다운로드 페이지로 이동하세요.",
        alt: "Android 앱 다운로드 QR 코드",
      },
      ios: {
        guideTitle: "iOS 설치 가이드",
        guideSteps:
          "기본 카메라 앱으로 코드를 비추어 사파리(Safari)로 열어 설치하세요.",
        alt: "iOS 앱 다운로드 QR 코드",
      },
    },
  },
  en: {
    title: "Download ZelonMeal App",
    subtitle: "Scan the QR code to install the app",
    androidTab: "Android",
    iosTab: "iOS",
    qrReadying: "QR Preparing",
    platforms: {
      android: {
        guideTitle: "Android Installation Guide",
        guideSteps:
          "Open your camera or QR scanner app to scan the code and download.",
        alt: "Android App Download QR Code",
      },
      ios: {
        guideTitle: "iOS Installation Guide",
        guideSteps:
          "Open your camera app to scan the code and open it in Safari to install.",
        alt: "iOS App Download QR Code",
      },
    },
  },
} as const;

type Locale = keyof typeof modalTexts;

const emptySubscribe = () => () => {};

export function useAppDownloadLanguage() {
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

  return { t: modalTexts[locale], locale };
}
