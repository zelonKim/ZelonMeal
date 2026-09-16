"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Utensils, User, ChartColumnIncreasing, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import Providers from "@/app/providers";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      Cookies.remove("userToken");
      Cookies.remove("refreshToken");
      router.replace("/login");
    }
  };

  const getNavLinkClass = (targetPath: string) => {
    const baseStyle =
      "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold ";
    const activeStyle =
      "bg-emerald-950/60 text-emerald-400 font-extrabold border border-emerald-900/30 shadow-sm";
    const inactiveStyle =
      "text-gray-400 hover:bg-gray-900/80 hover:text-gray-100";
    return `${baseStyle} ${pathname === targetPath ? activeStyle : inactiveStyle}`;
  };

  if (!mounted) {
    return <Providers>{children}</Providers>;
  }

  if (isAuthPage) {
    return <Providers>{children}</Providers>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <aside className="w-64 shrink-0 bg-gray-950 text-gray-400 z-30 h-full fixed top-0 left-0 transform-gpu hidden md:flex flex-col justify-between p-6 border-r border-r-gray-800">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-400 flex items-center justify-center text-gray-950 font-black text-sm">
              Z
            </div>
            <span className="font-black text-lg text-white tracking-tight">
              ZelonMeal{" "}
              <span className="text-xs text-emerald-400 font-bold ml-1">
                Pro
              </span>
            </span>
          </Link>

          <nav className="space-y-1.5">
            <Link href="/" className={getNavLinkClass("/")}>
              <Utensils
                size={18}
                className={
                  pathname === "/" ? "text-emerald-400" : "text-gray-400"
                }
              />
              <span className="text-[15px]">AI 추천 식단</span>
            </Link>

            <Link href="/stat" className={getNavLinkClass("/stat")}>
              <ChartColumnIncreasing
                size={18}
                className={
                  pathname === "/stat" ? "text-emerald-400" : "text-gray-400"
                }
              />
              <span className="text-[15px]">식단 통계</span>
            </Link>

            <Link href="/mypage" className={getNavLinkClass("/mypage")}>
              <User
                size={18}
                className={
                  pathname === "/mypage" ? "text-emerald-400" : "text-gray-400"
                }
              />
              <span className="text-[15px]">마이페이지</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-900 text-sm px-2 space-y-3">
          <button
            onClick={handleLogout}
            className="cursor-pointer w-full flex items-center gap-2.5 py-2 text-gray-400 hover:text-red-400 font-bold transition-all text-left group"
          >
            <LogOut
              size={15}
              className="group-hover:translate-x-0.5 transition-transform"
            />
            <span>로그아웃</span>
          </button>
          <p className="text-[10px] text-gray-600 pt-1">
            © 2026 ZelonMeal Corp.
          </p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto pl-0 md:pl-64">
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}
