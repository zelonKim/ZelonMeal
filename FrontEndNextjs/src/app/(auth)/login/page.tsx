"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 🌟 Next.js 16 App Router 전용 네비게이터
import { useMutation } from "@tanstack/react-query";
import { client } from "@/api/client";
import Cookies from "js-cookie"; // 🌟 웹 토큰 저장소의 표준 엔진
import { RefreshCw, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  // 🎯 [전면 개조] form submission의 개입을 차단하는 순수 버튼 클릭 핸들러
  const handleButtonClick = () => {
    if (validateForm()) {
      loginMutation.mutate();
    }
  };

  return (
    // 🌍 중앙 밸런스를 잡아주는 럭셔리 다크 슬레이트 배경 쉘
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 antialiased selection:bg-emerald-100">
      {/* 🔐 로그인 카드 메인 박스 */}
      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-4xl p-8 md:p-10 shadow-md shadow-gray-200/40 animate-fadeIn">
        {/* 상단 앱 브랜드 헤더 섹션 */}
        <div className="text-center mb-9">
          {/* <div className="w-12 h-12 rounded-2xl bg-emerald-400 flex items-center justify-center text-gray-950 font-black text-xl mx-auto shadow-md shadow-emerald-400/20 mb-3">
            Z
          </div> */}
          <span className="text-[13.5px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
            오늘의 건강한 한끼 식단
          </span>
          <h1 className="text-3xl font-black text-emerald-500 tracking-tight">
            ZelonMeal 🥑
          </h1>
        </div>

        {/* 🧼 onSubmit을 지우고 단순 배치 레이아웃 컨테이너(div)로 안정화 */}
        <div className="space-y-4">
          {/* 이메일 입력 웰 */}
          <div className="relative">
            <input
              type="email"
              disabled={loginMutation.isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요 "
              className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400  transition-all text-gray-800 placeholder:text-gray-400"
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

          {/* 🚀 type="button"과 onClick 다이렉트 바인딩으로 새로고침 완벽 배제 */}
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
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-[13.5px] font-semibold text-gray-400">
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
    </div>
  );
}
