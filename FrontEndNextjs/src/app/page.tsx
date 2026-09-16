"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import {
  Utensils,
  Flame,
  BookOpen,
  RefreshCw,
  Sparkles,
  MessageSquare,
  LayoutDashboard,
  Check,
  ShoppingCartIcon,
} from "lucide-react";
import { mealTimeMap } from "@/constants/mealTimeMap";
import { REQUIRED_PROFILE_FIELDS } from "@/constants/requiredProfileFields";
import { TODAY_STR } from "@/constants/todayStr";
import { AxiosError } from "axios";
import { ApiErrorRes } from "@/types/ApiErrorRes";

export default function TodayMealDashboard() {
  const queryClient = useQueryClient();
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [userFeedback, setUserFeedback] = useState("");

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await client.get("/v1/users/profile/");
      return response.data;
    },
    retry: false,
  });

  ///////////////////////////////////////////////////////////////////////

  const { data: todayPlan, isLoading: isTodayLoading } = useQuery({
    queryKey: ["todayMealPlan"],
    queryFn: async () => {
      const response = await client.get("/v1/meals/today/");
      return response.data;
    },
    retry: false,
  });

  const menuList: MealItem[] = todayPlan?.menu_list || [];

  ///////////////////////////////////////////////////////////////////////

  const recommendMutation = useMutation({
    mutationFn: async () => {
      const response = await client.post("/v1/meals/recommend/", {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["todayMealPlan"], data);
      queryClient.invalidateQueries({ queryKey: ["dailyStats", TODAY_STR] });
      alert("신체 정보를 분석해 맞춤 식단을 완벽히 구성했습니다!");
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      const errorMsg =
        error.response?.data?.detail ||
        "AI 식단을 생성하는 중 오류가 발생했습니다.";
      alert(`추천 실패 ${errorMsg}`);
    },
  });

  const handleMealRecommend = () => {
    if (!userProfile) {
      alert(
        "유저 프로필 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.",
      );
      return;
    }

    const missingFields: string[] = [];

    Object.keys(REQUIRED_PROFILE_FIELDS).forEach((field) => {
      const value = userProfile[field];

      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        missingFields.push(REQUIRED_PROFILE_FIELDS[field]);
      }
    });

    if (missingFields.length > 0) {
      alert(
        `⚠️프로필 미입력 \n\nAI가 맞춤 식단을 설계할 수 있도록 마이페이지에서 다음 항목을 입력해주세요!\n\n📍 필수 입력 항목:\n- ${missingFields.join("\n- ")}`,
      );
      return;
    }

    recommendMutation.mutate();
  };

  ///////////////////////////////////////////////////////////////////////

  const reRecommendMutation = useMutation({
    mutationFn: async (feedback: string) => {
      const response = await client.post("/v1/meals/rerecommend/", {
        user_feedback: feedback,
      });
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["todayMealPlan"], response.data);
      queryClient.invalidateQueries({ queryKey: ["dailyStats", TODAY_STR] });

      setFeedbackModalVisible(false);
      setUserFeedback("");
      alert("피드백을 반영하여 오늘의 식단을 완전히 재구성하였습니다!");
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      const errorMsg =
        error.response?.data?.detail || "식단 재추천 중 문제가 발생했습니다.";
      alert(`재추천 실패: ${errorMsg}`);
    },
  });

  const handleConfirmReRecommend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFeedback.trim()) {
      alert("식단을 보완할 피드백 내용을 입력해주세요!");
      return;
    }
    reRecommendMutation.mutate(userFeedback.trim());
  };

  ///////////////////////////////////////////////////////////////

  const isGlobalLoading =
    recommendMutation.isPending || reRecommendMutation.isPending;

  if (isGlobalLoading || isTodayLoading || isProfileLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-sm font-bold text-gray-600 animate-pulse">
            {isGlobalLoading
              ? "AI가 맞춤 영양 식단을 설계하고 있어요..."
              : "오늘의 추천 식단을 불러오고 있어요..."}
          </p>
        </div>
      </div>
    );
  }

  ////////////////////////////////////////////////////////////////////////////

  const handleZMartLink = (menuName: string) => {
    if (!menuName) return;
    const encodedKeyword = encodeURIComponent(menuName);
    const emartWebUrl = `https://m.ssg.com/search.ssg?query=${encodedKeyword}`;
    window.open(emartWebUrl, "_blank");
  };

  /////////////////////////////////////////////////////////////////////////////

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#F8FAFC]">
      <header className="h-16 shrink-0 bg-[white] border-b border-gray-100 shadow-md flex items-center justify-between px-8  shadow-gray-50/10">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <LayoutDashboard size={16} />
          <span className="text-gray-800 text-base font-extrabold">
            오늘의 AI 추천 식단
          </span>
        </div>

        {menuList.length > 0 && (
          <button
            onClick={() => setFeedbackModalVisible(true)}
            className="flex items-center gap-2 text-[13px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl hover:bg-emerald-100  transition-all shadow-sm"
          >
            <RefreshCw size={14} />
            <span>식단 다시 추천받기</span>
          </button>
        )}
      </header>

      <main className="flex-1 p-10 max-w-[1500px] w-full mx-auto">
        {menuList.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-9">
              {menuList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12.5px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                        {mealTimeMap[item.meal_time] || item.meal_time_display}
                      </span>
                      <div className="flex items-center gap-1 text-red-500 font-black text-[19px]">
                        <Flame size={14} className="fill-red-500" />
                        <span>
                          {item.calories}
                          <span className="text-sm font-bold ml-1">kcal</span>
                        </span>
                      </div>
                    </div>

                    <h3 className="text-[22px] font-bold text-gray-800 tracking-tight leading-snug min-h-[56px] flex items-center">
                      {item.menu_name}
                    </h3>

                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl mb-8 text-center">
                      <div>
                        <div className="text-[13px] font-bold text-gray-400">
                          탄수화물
                        </div>
                        <div className="text-lg font-black text-amber-500 mt-0.5">
                          {item.carbohydrates}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-400">
                          단백질
                        </div>
                        <div className="text-lg font-black text-emerald-500 mt-0.5">
                          {item.protein}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-400">
                          지방
                        </div>
                        <div className="text-lg font-black text-blue-500 mt-0.5">
                          {item.fat}g
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600/90">
                        <BookOpen size={14} />
                        <span>조리법 가이드</span>
                      </div>
                      <div className="text-sm text-gray-600/95 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 max-h-[140px] overflow-y-auto whitespace-pre-line">
                        {item.recipe
                          ? item.recipe.trim()
                          : "레시피 정보 준비 중"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleZMartLink(item.menu_name)}
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-400 text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <span>Z마트 식자재 담기</span>{" "}
                    <ShoppingCartIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-20 bg-white border border-gray-100 shadow-sm rounded-3xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
              <Utensils size={28} />
            </div>
            <h3 className="text-lg font-black text-gray-800">
              오늘의 추천 식단이 아직 없어요
            </h3>
            <p className="text-xs font-medium text-gray-400 mt-2 leading-relaxed">
              최신 신체 정보와 식단 관리 목적을 분석하여
              <br />
              완벽한 영양 성분 밸런스 식단을 설계해 드립니다.
            </p>

            <button
              onClick={handleMealRecommend}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-400/20 transform active:scale-98"
            >
              <span>AI 맞춤 식단 설계받기</span>
              <Sparkles size={18} className="ml-1" />
            </button>
          </div>
        )}
      </main>

      {feedbackModalVisible && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100/50 transform transition-all m-4">
            <div className="flex items-center gap-2 text-lg font-black text-gray-900 mb-2">
              <MessageSquare size={20} className="text-emerald-500" />
              <h3>식단 보완 요청</h3>
            </div>
            <p className="text-sm font-medium text-gray-500 leading-normal mb-5">
              현재 식단에서 보완하고 싶은 내용을 입력하면 AI가 다시 식단을
              추천해줘요!
            </p>

            <form onSubmit={handleConfirmReRecommend} className="space-y-5">
              <textarea
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="예: 오늘 저녁은 동물성 단백질이 아닌, 식물성 단백질 요리로 대체해줘!"
                maxLength={120}
                autoFocus
                className="w-full h-24 bg-gray-50 border border-gray-200 focus:border-emerald-300 focus:outline-none p-4 rounded-xl text-[15px] font-medium resize-none transition-all placeholder:text-gray-400/80 text-gray-900"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackModalVisible(false)}
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 text-[15px] font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-950 text-white text-[15px] font-bold py-3 rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>입력 완료</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
