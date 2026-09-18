import { PlatformConfig } from "@/types/PlatformConfig";

export const PLATFORM_CONFIG: Record<"android" | "ios", PlatformConfig> = {
  android: {
    qrSrc: "/images/ZelonMeal_android_link.png",
    alt: "Android QR",
    guideTitle: "🤖 Android 설치 안내",
    guideSteps: (
      <>
        1. 스마트폰 카메라로 QR 코드를 스캔합니다.
        <br />
        2. 다운로드된{" "}
        <strong className="font-bold text-emerald-700">APK 파일</strong>을 실행하여 앱 설치를 완료해 주세요.
      </>
    ),
    theme: {
      badgeBg: "bg-emerald-50",
      badgeBorder: "border-emerald-100",
      badgeText: "text-emerald-600",
      strongText: "text-emerald-700",
    },
  },
  ios: {
    qrSrc: "/images/ZelonMeal_ios_link.png",
    alt: "iOS TestFlight QR",
    guideTitle: "🍏 iOS 설치 안내",
    guideSteps: (
      <>
        1. iPhone 카메라로 QR 코드를 스캔합니다.
        <br />
        2. 안내에 따라{" "}
        <strong className="font-bold text-green-700">TestFlight</strong> 앱을 먼저 설치한 뒤, 정식 베타 테스터로 입장해 주세요.
      </>
    ),
    theme: {
      badgeBg: "bg-green-50",
      badgeBorder: "border-green-100",
      badgeText: "text-green-600",
      strongText: "text-green-700",
    },
  },
};