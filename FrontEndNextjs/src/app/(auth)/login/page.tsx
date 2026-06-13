"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { useMutation } from "@tanstack/react-query";
import { client } from "@/api/client";
import Cookies from "js-cookie"; 
import { RefreshCw, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1️⃣ 최초 진입 시 기존에 남아있던 브라우저 토큰 싹 청소 (모바일 로직 고스란히 이식)
  useEffect(() => {
    const clearTokens = () => {
      try {
        Cookies.remove("userToken");
        Cookies.remove("refreshToken");
        // 필요 시 전역 Auth Context Status 상태 초기화 메서드 호출 가능
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

  // 2️⃣ [POST] 장고 Simple JWT 백엔드 로그인 API 연동 쉘
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
        // 🔒 [웹 정석] 보안 가드를 고려해 쿠키(Cookies) 유효기간 설정 후 저장
        Cookies.set("userToken", data.access, { expires: 1 }); // 1일 유지
        Cookies.set("refreshToken", data.refresh, { expires: 7 }); // 7일 유지

        // 로그인 성공 시 대시보드 마스터 홈 경로로 순간이동!
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 전송 시 브라우저 강제 새로고침 원천 봉쇄
    if (validateForm()) {
      loginMutation.mutate();
    }
  };

  return (
    // 🌍 큰 모니터 화면에서도 뒤틀림 없이 정중앙 포커싱을 잡아주는 럭셔리 다크 슬레이트 배경 쉘
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 antialiased selection:bg-emerald-100">
      
      {/* 🔐 로그인 카드 메인 박스 (모바일 터치 폼을 와이드 웹 쉘로 최적화) */}
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-xl shadow-gray-200/40">
        
        {/* 상단 앱 브랜드 헤더 섹션 */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400 flex items-center justify-center text-gray-950 font-black text-xl mx-auto shadow-md shadow-emerald-400/20 mb-3">
            Z
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
            오늘의 건강한 AI 식단 관리
          </span>
          <h1 className="text-3xl font-black text-emerald-500 tracking-tight">
            ZelonMeal
          </h1>
        </div>

        {/* 입력 폼 본체 쉘 */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* 이메일 인풋 인라인 카드 */}
          <div className="relative">
            <input
              type="email"
              disabled={loginMutation.isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소 입력"
              className="w-full bg-gray-50 text-sm font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
            <Mail size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          {/* 비밀번호 인풋 인라인 카드 */}
          <div className="relative">
            <input
              type="password"
              disabled={loginMutation.isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full bg-gray-50 text-sm font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
            <Lock size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          {/* 🚀 로그인 액션 코어 버튼 (로딩 스피너 이식 완비) */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`w-full h-13 mt-2 flex items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition-all shadow-md active:scale-[0.99] ${
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
        </form>

        {/* 📭 하단 회원가입 이동 링크 세팅 */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
          <span>아직 계정이 없으신가요?</span>
          <Link
            href="/signup" // 성진님의 다음 폴더 구조 주소로 다이렉트 랜딩
            className={`text-emerald-500 font-bold hover:text-emerald-600 transition-all ${
              loginMutation.isPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            회원가입 하기
          </Link>
        </div>

      </div>
    </div>
  );
}