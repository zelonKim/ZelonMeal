"use client";
import React, { useState } from "react";
import { RefreshCw, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSignupMutation } from "@/hooks/useSignupMutation";
import { useSignupLanguage } from "@/hooks/languages/useSignupLanguage";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { t } = useSignupLanguage();
  const { mutate: signupMutation, isPending: signupPending } =
    useSignupMutation();

  const handleSignup = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert(t.alertEmail);
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      alert(t.alertPassword);
      return false;
    }

    if (password !== passwordConfirm) {
      alert(t.alertPasswordMismatch);
      return false;
    }

    signupMutation({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-md">
        <div className="mb-9 text-left">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            {t.title}
          </h1>
          <p className="text-sm font-semibold text-gray-500 my-2">
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              disabled={signupPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
            />
            <Mail size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              disabled={signupPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
            />
            <Lock size={16} className="absolute left-4 top-4.5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              disabled={signupPending}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder={t.passwordConfirmPlaceholder}
              className="w-full bg-gray-50 text-[15px] font-medium pl-11 pr-4 py-3.5 rounded-xl border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
            />
            <CheckCircle2
              size={16}
              className="absolute left-4 top-4.5 text-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={handleSignup}
            disabled={signupPending}
            className={`cursor-pointer w-full h-13 mt-4 flex items-center justify-center gap-2 rounded-xl text-md font-bold text-white transition-all shadow-md active:scale-[0.99] ${
              signupPending
                ? "bg-emerald-300 cursor-wait"
                : "bg-emerald-400 hover:bg-emerald-500 shadow-emerald-400/20"
            }`}
          >
            {signupPending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <span>{t.startButton}</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400">
          <span>{t.hasAccount}</span>
          <Link
            href="/login"
            className="text-emerald-500 font-bold hover:text-emerald-600"
          >
            {t.loginLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
