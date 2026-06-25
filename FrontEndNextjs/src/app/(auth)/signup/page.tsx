"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다. 🙅‍♂️");
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("비밀번호는 영문과 숫자를 조합하여 8자리 이상 입력해주세요. 🔒");
      return false;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다. 👥");
      return false;
    }

    return true;
  };

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
      router.replace("/login");
    },
    onError: (error: any) => {
      console.error("❌ 백엔드 통신 에러 발생 로그:", error);
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

  // 🎯 [이름 검증 완료] 클릭 시 무조건 이 안으로 도달하게 만듭니다.
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (validateForm()) {
      signupMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-md">
        <div className="mb-9 text-left">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            식사하셨나요? 📋
          </h1>
          <p className="text-sm font-semibold text-gray-500 my-2">
            AI로부터 건강한 식단을 추천받아보세요!
          </p>
        </div>

        {/* 🧼 onSubmit 제거: 엔터키나 폼 전송 오작동을 완전히 세척한 순수 레이아웃 div로 강제 하향 조정 */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              disabled={signupMutation.isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className=" w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
            />
            <Mail size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              disabled={signupMutation.isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (영문/숫자 조합 8자 이상)"
              className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
            />
            <Lock size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              disabled={signupMutation.isPending}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 확인"
              className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
            />
            <CheckCircle2
              size={16}
              className="absolute left-4 top-4.5 text-gray-400"
            />
          </div>

          {/* 🚀 onClick 핸들러 명확하게 바인딩 완비 */}
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={signupMutation.isPending}
            className={`w-full h-13 mt-4 flex items-center justify-center gap-2 rounded-xl text-md font-bold text-white transition-all shadow-md active:scale-[0.99] ${
              signupMutation.isPending
                ? "bg-emerald-300 cursor-wait"
                : "bg-emerald-400 hover:bg-emerald-500 shadow-emerald-400/20"
            }`}
          >
            {signupMutation.isPending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <span>시작하기</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400">
          <span>이미 계정이 있으신가요?</span>
          <Link
            href="/login"
            className="text-emerald-500 font-bold hover:text-emerald-600"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
