"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 🌟 Next.js 16 App Router 전용 네비게이터
import { useMutation } from "@tanstack/react-query";
import { client } from "@/api/client";
import Cookies from "js-cookie"; // 🌟 웹 토큰 저장소의 표준 엔진
import {
  RefreshCw,
  Lock,
  Mail,
  ArrowRight,
  X,
  Smartphone,
  ScanQrCode,
} from "lucide-react";
import Link from "next/link";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🍏 앱 다운로드 모달 관련 상태값
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ios" | "android">("ios");

  // 🍏 QR 이미지 로드 실패 방어용 리액트 상태값
  const [iosQrError, setIosQrError] = useState(false);
  const [androidQrError, setAndroidQrError] = useState(false);

  // 1️⃣ 최초 진입 시 기존에 남아있던 브라우저 토큰 싹 청소
  useEffect(() => {
    const clearTokens = () => {
      try {
        Cookies.remove("userToken");
        Cookies.remove("refreshToken");
      } catch (err) {
        console.error("토큰 제거 중 에러 발생:", err);
      }
    };
    clearTokens();
  }, []);

  const validateForm = () => {
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return false;
    }
    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return false;
    }
    return true;
  };

  // 2️⃣ [POST] 장고 Simple JWT 백엔드 로그인 API 연동
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await client.post("/v1/users/login/", {
        email: email.trim(),
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      try {
        Cookies.set("userToken", data.access, { expires: 1 });
        Cookies.set("refreshToken", data.refresh, { expires: 7 });
        router.replace("/");
      } catch (e) {
        alert("인증 정보를 저장하는 중 오류가 발생했습니다.");
      }
    },
    onError: (error: any) => {
      const serverError = error.response?.data;
      let errorMessage = "이메일 또는 비밀번호를 다시 확인해주세요.";

      if (serverError && serverError.detail) {
        errorMessage = serverError.detail;
        if (errorMessage.includes("No active account")) {
          errorMessage = "이메일 혹은 비밀번호가 틀렸습니다.";
        }
      }
      alert(errorMessage);
    },
  });

  const handleButtonClick = () => {
    if (validateForm()) {
      loginMutation.mutate();
    }
  };

  return (
    // 🌍 중앙 밸런스를 잡아주는 럭셔리 다크 슬레이트 배경 쉘
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 antialiased selection:bg-emerald-100 relative">
      {/* 🍏 우측 상단 앱 다운로드 버튼 고정 배치 */}
      <div className="absolute top-6 right-6 z-10">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-gray-200 text-sm font-semibold hover:bg-gray-800 hover:text-white transition-all shadow-lg active:scale-95"
        >
          <Smartphone size={14} className="text-emerald-400" />
          <span>앱 다운로드</span>
        </button>
      </div>

      {/* 🔐 로그인 카드 메인 박스 */}
      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-4xl p-8 md:p-10 shadow-md shadow-gray-200/40 animate-fadeIn">
        {/* 상단 앱 브랜드 헤더 섹션 */}
        <div className="text-center mb-9">
          <span className="text-[13.5px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
            오늘의 건강한 한끼 식단
          </span>
          <h1 className="text-[32px] font-black text-emerald-500 tracking-tight">
            ZelonMeal 🥑
          </h1>
        </div>

        <div className="space-y-4">
          {/* 이메일 입력 웰 */}
          <div className="relative">
            <input
              type="email"
              disabled={loginMutation.isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요 "
              className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 transition-all text-gray-800 placeholder:text-gray-400"
            />
            <Mail size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          {/* 비밀번호 입력 웰 */}
          <div className="relative">
            <input
              type="password"
              disabled={loginMutation.isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-gray-50 transition-all text-gray-800 placeholder:text-gray-400"
            />
            <Lock size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={loginMutation.isPending}
            className={`w-full h-13 mt-6 flex items-center justify-center gap-2 rounded-xl text-md font-bold text-white transition-all shadow-md active:scale-[0.99] ${
              loginMutation.isPending
                ? "bg-emerald-300 shadow-none cursor-wait"
                : "bg-emerald-400 hover:bg-emerald-500 shadow-emerald-400/20"
            }`}
          >
            {loginMutation.isPending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <span>로그인</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

        {/* 📭 하단 회원가입 이동 링크 세팅 */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400">
          <span>아직 계정이 없으신가요?</span>
          <Link
            href="/signup"
            className={`text-emerald-500 font-bold hover:text-emerald-600 transition-all ${
              loginMutation.isPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            회원가입
          </Link>
        </div>
      </div>

      {/* 🍏 QR 안내 오버레이 모달 스크립트 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 relative shadow-2xl border border-gray-100">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all"
            >
              <X size={20} />
            </button>

            {/* 타이틀 영역 */}
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

            {/* OS 전환 탭 세그먼트 */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("android")}
                className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${
                  activeTab === "android"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ios")}
                className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${
                  activeTab === "ios"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                iOS
              </button>
            </div>

            {/* 탭별 QR 코드 및 안내 카드 본문 */}
            <div className="flex flex-col items-center text-center">
              {activeTab === "ios" ? (
                <>
                  <div className="w-44 h-44 bg-gray-50 border border-gray-200/60 rounded-2xl flex items-center justify-center p-2 mb-4 shadow-inner">
                    {/* 상태 조건에 따라 분기 렌더링 (리액트 정석) */}
                    {iosQrError ? (
                      <span className="text-[11px] font-semibold text-gray-400 px-4 text-center">
                        iOS
                        <br />
                        QR 준비 중
                      </span>
                    ) : (
                      <img
                        src="/images/ZelonMeal_ios_link.png"
                        alt="iOS TestFlight QR"
                        className="w-full h-full object-contain"
                        onError={() => setIosQrError(true)}
                      />
                    )}
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 w-full text-left mt-1">
                    <span className="text-[13px] font-bold text-green-700 block mb-1">
                      🍏 iOS 설치 안내
                    </span>
                    <p className="text-[12px] text-green-600 leading-relaxed font-medium">
                      1. iPhone 카메라로 QR 코드를 스캔합니다.
                      <br />
                      2. 안내에 따라{" "}
                      <strong className="font-bold text-green-700">
                        TestFlight
                      </strong>{" "}
                      앱을 먼저 설치한 뒤, 정식 베타 테스터로 입장해 주세요.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* 🤖 Android 안내 카드 */}
                  <div className="w-44 h-44 bg-gray-50 border border-gray-200/60 rounded-2xl flex items-center justify-center p-2 mb-4 shadow-inner">
                    {androidQrError ? (
                      <span className="text-[11px] font-semibold text-gray-400 px-4 text-center">
                        Android
                        <br />
                        QR 준비 중
                      </span>
                    ) : (
                      <img
                        src="/images/ZelonMeal_android_link.png"
                        alt="Android QR"
                        className="w-full h-full object-contain"
                        onError={() => setAndroidQrError(true)}
                      />
                    )}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 w-full text-left mt-1">
                    <span className="text-[13px] font-bold text-emerald-700 block mb-1">
                      🤖 Android 설치 안내
                    </span>
                    <p className="text-[12px] text-emerald-600 leading-relaxed font-medium">
                      1. 스마트폰 카메라로 QR 코드를 스캔합니다.
                      <br />
                      2. 다운로드된{" "}
                      <strong className="font-bold text-emerald-700">
                        APK 파일
                      </strong>
                      을 실행하여 앱 설치를 완료해 주세요.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
