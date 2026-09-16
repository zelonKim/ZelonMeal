"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { RefreshCw, Lock, Mail, ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import AppDownloadModal from "@/components/AppDownloadModal";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  //////////////////////////////////////////////////////////////////////

  const { mutate: loginMutation, isPending: loginPending } = useLoginMutation();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    loginMutation({ email, password });
  };

  //////////////////////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 antialiased selection:bg-emerald-100 relative">
      <div className="absolute top-6 right-6 z-10">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-gray-200 text-sm font-semibold hover:bg-gray-800 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          <Smartphone size={14} className="text-emerald-400" />
          <span>앱 다운로드</span>
        </button>
      </div>

      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-4xl p-8 md:p-10 shadow-md shadow-gray-200/40 animate-fadeIn">
        <div className="text-center mb-9">
          <span className="text-[13.5px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
            오늘의 건강한 한끼 식단
          </span>
          <h1 className="text-[32px] font-black text-emerald-500 tracking-tight">
            ZelonMeal 🥑
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="email"
                disabled={loginPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해주세요 "
                className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 transition-all text-gray-800 placeholder:text-gray-400"
              />
              <Mail
                size={16}
                className="absolute left-4 top-4.5 text-gray-400"
              />
            </div>

            <div className="relative">
              <input
                type="password"
                disabled={loginPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-gray-50 transition-all text-gray-800 placeholder:text-gray-400"
              />
              <Lock
                size={16}
                className="absolute left-4 top-4.5 text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loginPending}
              className={`w-full h-13 mt-6 flex items-center justify-center gap-2 rounded-xl text-md font-bold text-white transition-all shadow-md active:scale-[0.99] ${
                loginPending
                  ? "bg-emerald-300 shadow-none cursor-wait"
                  : "bg-emerald-400 hover:bg-emerald-500 shadow-emerald-400/20"
              }`}
            >
              {loginPending ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <>
                  <span>로그인</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400">
          <span>아직 계정이 없으신가요?</span>
          <Link
            href="/signup"
            className={`text-emerald-500 font-bold hover:text-emerald-600 transition-all ${
              loginPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            회원가입
          </Link>
        </div>
      </div>

      <AppDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
