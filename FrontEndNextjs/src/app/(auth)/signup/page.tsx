"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // 🌟 Next.js 16 App Router 전용 라우터
import { useMutation } from "@tanstack/react-query";
import { client } from "@/api/client";
import { RefreshCw, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const validateForm = () => {
    // 1. 이메일 형식 정규식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return false;
    }

    // 2. 비밀번호 영문 + 숫자 조합 및 8자리 이상 검사
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("비밀번호는 영문과 숫자를 조합하여 8자리 이상 입력해주세요.");
      return false;
    }

    // 3. 비밀번호 일치 확인 검사
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return false;
    }

    return true;
  };

  // 🚀 [POST] 장고 백엔드 회원가입 API 연동 쉘
  const signupMutation = useMutation({
    mutationFn: async () => {
      const response = await client.post("/v1/users/signup/", {
        email: email.trim(),
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      alert(data.message || "회원가입이 정상적으로 완료되었습니다. 🤗");
      // 가입 성공 직후 로그인방으로 점프 이동!
      router.replace("/login");
    },
    onError: (error: any) => {
      const serverError = error.response?.data;
      let errorMessage = "서버와 통신 중 오류가 발생했습니다.";

      if (serverError) {
        if (serverError.email) {
          errorMessage = Array.isArray(serverError.email)
            ? serverError.email[0]
            : serverError.email;
        } else if (serverError.password) {
          errorMessage = Array.isArray(serverError.password)
            ? serverError.password[0]
            : serverError.password;
        } else if (serverError.message) {
          errorMessage = serverError.message;
        }
      }
      alert(errorMessage);
    },
  });

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault(); // 웹 브라우저 새로고침 디폴트 액션 차단 가드
    if (validateForm()) {
      signupMutation.mutate();
    }
  };

  return (
    // 🌍 중앙 밸런스를 보증하는 백그라운드 쉘
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 antialiased selection:bg-emerald-100">
      {/* 🥑 회원가입 박스 프레임 */}
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-xl shadow-gray-200/40 animate-fadeIn">
        {/* 상단 웰컴 문구 라인 */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            반가워요! 🥑
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-2">
            ZelonMeal에 가입하고 건강한 식사를 만들어가세요.
          </p>
        </div>

        {/* 웹 표준 인풋 폼 벨트 */}
        <form onSubmit={handleSignUp} className="space-y-4">
          {/* 이메일 인풋 웰 */}
          <div className="relative">
            <input
              type="email"
              disabled={signupMutation.isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-full bg-gray-50 text-sm font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
            <Mail size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          {/* 비밀번호 인풋 웰 */}
          <div className="relative">
            <input
              type="password"
              disabled={signupMutation.isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (영문/숫자 조합 8자 이상)"
              className="w-full bg-gray-50 text-sm font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
            <Lock size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          {/* 비밀번호 확인 재입력 웰 */}
          <div className="relative">
            <input
              type="password"
              disabled={signupMutation.isPending}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 확인"
              className="w-full bg-gray-50 text-sm font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
            <CheckCircle2
              size={16}
              className="absolute left-4 top-4.5 text-gray-400"
            />
          </div>

          {/* 🚀 전송 액션 코어 버튼 (비활성화 스키마 매립) */}
          <button
            type="submit"
            disabled={signupMutation.isPending}
            className={`w-full h-13 mt-4 flex items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition-all shadow-md active:scale-[0.99] ${
              signupMutation.isPending
                ? "bg-emerald-300 shadow-none cursor-wait"
                : "bg-emerald-400 hover:bg-emerald-500 shadow-emerald-400/20"
            }`}
          >
            {signupMutation.isPending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <span> 시작하기</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* 📭 하단 백로그인 가이드 인터렉션 */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
          <span>이미 계정이 있으신가요?</span>
          <Link
            href="/login" // (auth) 라우트 그룹 덕에 그냥 /login으로 깔끔하게 매핑
            className={`text-emerald-500 font-bold hover:text-emerald-600 transition-all ${
              signupMutation.isPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
