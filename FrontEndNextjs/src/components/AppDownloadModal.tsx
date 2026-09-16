import { useState } from "react";
import { X, ScanQrCode } from "lucide-react";
import { PLATFORM_CONFIG } from "@/constants/platformConfig";
import { AppDownloadModalProps } from "@/types/AppDownloadModalProps";
import { PlatformTab } from "@/types/PlatformTab";


export default function AppDownloadModal({
  isOpen,
  onClose,
}: AppDownloadModalProps) {
  const [activeTab, setActiveTab] = useState<PlatformTab>("android");
  const [qrErrors, setQrErrors] = useState<Record<PlatformTab, boolean>>({
    android: false,
    ios: false,
  });

  if (!isOpen) return null;

  const currentConfig = PLATFORM_CONFIG[activeTab];
  const isCurrentQrError = qrErrors[activeTab];

  const handleQrError = (platform: PlatformTab) => {
    setQrErrors((prev) => ({ ...prev, [platform]: true }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 relative shadow-2xl border border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center mt-2 mb-5">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
            <ScanQrCode size={20} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            ZelonMeal 앱 다운로드
          </h3>
          <p className="text-[13px] text-gray-500 mt-1 mb-8">
            QR 코드를 스캔하여 앱을 설치해 보세요
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          {(["android", "ios"] as PlatformTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "android" ? "Android" : "iOS"}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-44 h-44 bg-gray-50 border border-gray-200/60 rounded-2xl flex items-center justify-center p-2 mb-4 shadow-inner">
            {isCurrentQrError ? (
              <span className="text-[11px] font-semibold text-gray-400 px-4 text-center">
                {activeTab === "android" ? "Android" : "iOS"}
                <br />
                QR 준비 중
              </span>
            ) : (
              <img
                src={currentConfig.qrSrc}
                alt={currentConfig.alt}
                className="w-full h-full object-contain"
                onError={() => handleQrError(activeTab)}
              />
            )}
          </div>

          <div
            className={`border rounded-xl p-3 w-full text-left mt-1 ${currentConfig.theme.badgeBg} ${currentConfig.theme.badgeBorder}`}
          >
            <span
              className={`text-[13px] font-bold block mb-1 ${currentConfig.theme.strongText}`}
            >
              {currentConfig.guideTitle}
            </span>
            <p
              className={`text-[12px] leading-relaxed font-medium ${currentConfig.theme.badgeText}`}
            >
              {currentConfig.guideSteps}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
