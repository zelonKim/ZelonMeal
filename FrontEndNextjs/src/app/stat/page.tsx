"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flame,
  Utensils,
  TrendingUp,
  Activity,
  RotateCw,
} from "lucide-react";

const mealEmojiMap: Record<string, string> = {
  BREAKFAST: "☀️ 아침",
  LUNCH: "🍱 점심",
  DINNER: "🌙 저녁",
  SNACK: "🧁 간식",
};

export default function StatScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // 🔽 드롭다운 열림/닫힘 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // 렌더링 영역 외 클릭 감지용 Ref 가드
  const dropdownRef = useRef<HTMLDivElement>(null);

  const RECOMMENDED_GOALS = {
    calories: 2000,
    carbs: 250,
    protein: 120,
    fat: 60,
  };

  const getFormattedYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDisplayDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
  };

  const currentFormattedDate = getFormattedYYYYMMDD(selectedDate);

  const { data: serverStats, isLoading } = useQuery({
    queryKey: ["dailyStats", currentFormattedDate],
    queryFn: async () => {
      const response = await client.get(
        `/v1/meals/stats/?date=${currentFormattedDate}`,
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // 🧼 [클릭 쉴드] 달력이 열려있을 때 바깥 빈 곳을 누르면 자동으로 드롭다운 접기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(nextDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(selectedDate);
    const today = new Date();
    if (getFormattedYYYYMMDD(nextDate) > getFormattedYYYYMMDD(today)) return;
    nextDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  const handleDropdownDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    setSelectedDate(new Date(e.target.value));
    setIsDropdownOpen(false); // 날짜 선택 시 군더더기 없이 리포트 전환 후 자동 폐쇄
  };

  const getProgressWidth = (
    current: number | undefined | null,
    goal: number,
  ) => {
    const safeCurrent = current ?? 0;
    if (safeCurrent <= 0 || !goal) return "0%";
    const percentage = Math.min((safeCurrent / goal) * 100, 100);
    return `${percentage}%`;
  };

  const calories = Number(serverStats?.calories ?? 0);
  const carbs = Number(serverStats?.carbohydrates ?? 0);
  const protein = Number(serverStats?.protein ?? 0);
  const fat = Number(serverStats?.fat ?? 0);
  const menuList = serverStats?.menu_names || [];

  return (
    <div className="flex-1 bg-[#F8FAFC] p-6 max-w-6xl w-full mx-auto space-y-6 antialiased">
      {/* 🚀 1층 툴바 존 */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-row items-center justify-center gap-4">
        {/* 기준점 배치를 위한 relative 박스 가드 래핑 */}
        <div
          ref={dropdownRef}
          className="relative flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
        >
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all border border-gray-200/40 shadow-sm active:scale-95"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>

          <div className=" bg-white  shadow-sm rounded-2xl z-40 w-40  ">
            <input
              type="date"
              max={getFormattedYYYYMMDD(new Date())}
              value={currentFormattedDate}
              onChange={handleDropdownDateChange}
              className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100  focus:border-emerald-400 focus:bg-white focus:outline-none py-2 px-6 rounded-xl text-sm font-black text-gray-800 cursor-pointer text-center"
            />
          </div>
          <button
            onClick={handleNextDay}
            disabled={
              getFormattedYYYYMMDD(selectedDate) ===
              getFormattedYYYYMMDD(new Date())
            }
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all border border-gray-200/40 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="w-24 flex justify-start ms-2">
          <button
            onClick={handleGoToToday}
            className="w-auto bg-emerald-400 text-gray-800 font-black text-[13px] px-5 py-2.5 rounded-xl hover:bg-emerald-500 transition-all shadow-md shadow-emerald-400/10 active:scale-98"
          >
            오늘
          </button>
        </div>
      </div>

      {/* 🔮 2층 존: 웹 최적화 와이드 양대 레이아웃 스플릿 스킨 */}
      {isLoading ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-20 flex flex-col items-center justify-center min-h-[400px]">
          <RotateCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm font-bold text-gray-600 animate-pulse">
            날짜별 통계 데이터를 불러오고 있어요...
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className=" lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-md font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3">
                <TrendingUp size={16} className="text-emerald-500" />
                <span>일일 섭취한 총 영양소</span>
              </h3>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between mt-4">
                <div className="space-y-1">
                  <span className="text-[12px] font-bold text-gray-400 block uppercase">
                    TOTAL CALORIES
                  </span>
                  <p className="text-[13px] font-semibold text-gray-500">
                    권장 목표치{" "}
                    <span className="font-bold text-gray-700">
                      {RECOMMENDED_GOALS.calories}kcal
                    </span>{" "}
                    대비 섭취량
                  </p>
                </div>
                <div className="flex items-baseline gap-1 text-2xl font-black text-red-500">
                  <Flame
                    size={20}
                    className="fill-red-500 text-red-500 self-center mr-1"
                  />
                  <span>{calories}</span>
                  <span className="text-xs font-bold text-red-400">kcal</span>
                </div>
              </div>

              <div className="space-y-5 mt-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[13px] font-bold">
                    <span className="text-gray-500">
                      🌾 탄수화물 ({RECOMMENDED_GOALS.carbs}g 기준)
                    </span>
                    <span className="text-amber-500 font-black text-lg ">
                      {carbs}g
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <div
                      style={{
                        width: getProgressWidth(carbs, RECOMMENDED_GOALS.carbs),
                      }}
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[13px] font-bold">
                    <span className="text-gray-500 ">
                      🍗 단백질 ({RECOMMENDED_GOALS.protein}g 기준)
                    </span>
                    <span className="text-emerald-500 font-black text-lg ">
                      {protein}g
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <div
                      style={{
                        width: getProgressWidth(
                          protein,
                          RECOMMENDED_GOALS.protein,
                        ),
                      }}
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[13px] font-bold">
                    <span className="text-gray-500">
                      🥑 지방 ({RECOMMENDED_GOALS.fat}g 기준)
                    </span>
                    <span className="text-blue-500 font-black text-lg ">
                      {fat}g
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <div
                      style={{
                        width: getProgressWidth(fat, RECOMMENDED_GOALS.fat),
                      }}
                      className="h-full rounded-full bg-blue-400 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-gray-400 text-right pt-2 border-t border-gray-50/60">
              * 최신 신체 정보 기준 일일 섭취 밸런스 매트릭스 가이드라인입니다.
            </div>
          </div>

          <div className=" bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="text-md font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3 mb-4">
              {/* <Utensils size={15} className="text-emerald-500" /> */}
              <span>📋 식단 기록</span>
            </h3>

            <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-2.5 custom-scrollbar">
              {menuList.length > 0 ? (
                menuList.map((menu: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 bg-gray-50/80 border border-gray-100 hover:border-emerald-100 hover:bg-white rounded-xl p-3.5 transition-all shadow-sm shadow-gray-100/10 items-center"
                  >
                    <span className="text-[12px] font-black bg-white border border-gray-200/60 text-emerald-600 px-2 py-0.5 rounded-md w-max ">
                      {mealEmojiMap[menu.meal_time] || menu.meal_time}
                    </span>
                    <span className="text-[15px] font-bold text-gray-800/90 mt-1 tracking-tigh text-center">
                      {menu.menu_name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full min-h-[200px] bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                  <Activity size={22} className="text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-400">
                    해당 날짜에 기입되거나
                    <br />
                    추천받은 식단 기록이 비어있습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
