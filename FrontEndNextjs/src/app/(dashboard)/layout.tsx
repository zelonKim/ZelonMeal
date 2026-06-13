import React from "react";
import Link from "next/link";
import { Utensils, User, ChartColumnIncreasing, Settings } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-gray-800">
      {/* 🔮 좌측 고정형 프로급 마스터 사이드바 (dashboard 그룹 내부에서만 영구 노출! 🛡️) */}
      <aside className="w-64 shrink-0 bg-gray-950 text-gray-400 hidden md:flex flex-col justify-between p-6 border-r border-r-gray-800 z-30 h-screen sticky top-0">
        <div className="space-y-8">
          {/* 로고 레이어 */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-400 flex items-center justify-center text-gray-950 font-black text-sm">
              Z
            </div>
            <span className="font-black text-lg text-white tracking-tight">
              ZelonMeal{" "}
              <span className="text-xs text-emerald-400 font-bold ml-1">
                Pro
              </span>
            </span>
          </div>

          {/* 내비게이션 링크 체계 */}
          <nav className="space-y-1.5">
            <Link
              href="/"
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-900 hover:text-gray-200 transition-all"
            >
              <Utensils size={18} />
              <span>AI 추천 식단</span>
            </Link>

            <Link
              href="/mypage"
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-900 hover:text-gray-200 transition-all"
            >
              <User size={18} />
              <span>마이페이지</span>
            </Link>

            <Link
              href="/stat"
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-900 hover:text-gray-200 transition-all"
            >
              <ChartColumnIncreasing size={18} />
              <span>식단 통계</span>
            </Link>
          </nav>
        </div>

        {/* 하단 푸터 가드 */}
        <Link
          href="/login"
          className="pt-6 border-t border-gray-900 space-y-1 text-xs px-2"
        >
          <div className="flex items-center gap-2 py-2 hover:text-gray-200 cursor-pointer transition-all">
            <Settings size={14} />
            <span>로그아웃</span>
          </div>
          <p className="text-[10px] text-gray-600 pt-2">
            © 2026 ZelonMeal Corp.
          </p>
        </Link>
      </aside>

      {/* 🍿 우측 가변 작업 뷰포트 영역: 메인 홈, 마이페이지, 통계페이지가 레이아웃 간섭 없이 안전 착륙 */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
