"use client";

import React from "react";

export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-gray-900">✏️ 마이페이지</h1>
        <p className="text-sm text-gray-500 mt-1">
          성진님의 신체 스펙 및 식단 관리 목적을 변경하는 공간입니다.
        </p>

        {/* 아까 웹 버전 대시보드에 만들었던 내용들을 여기에 이식하면 됩니다! */}
        <div className="mt-6 p-4 bg-emerald-50 rounded-xl text-emerald-800 font-bold text-sm">
          식단 1일차 🥑 라이브 구동 중
        </div>
      </div>
    </div>
  );
}
