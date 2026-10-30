"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { getUserProfile } from "@/api/user/getUserProfile";
import { getTodayMealPlan } from "@/api/meal/getTodayMealPlan";
import { MealItem } from "@/types/MealItem";
import { UserProfile } from "@/types/UserProfile";
import { useRecommendMeal } from "@/hooks/useRecommendMeal";
import { useReRecommendMeal } from "@/hooks/useReRecommendMeal";
import { handleZMartLink } from "@/utils/handleZMartLink";
import { useDashboardLanguage } from "@/hooks/languages/useDashboardLanguage";

export default function TodayMealDashboard() {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [userFeedback, setUserFeedback] = useState("");

  const { t } = useDashboardLanguage(); // 👈 다국어 훅 사용

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    retry: false,
  });

  const { data: todayPlan, isLoading: isTodayLoading } = useQuery({
    queryKey: ["todayMealPlan"],
    queryFn: getTodayMealPlan,
  });

  const menuList: MealItem[] = todayPlan?.menu_list || [];

  const { mutate: recommendMutation, isPending: recommendPending } =
    useRecommendMeal();

  const handleMealRecommend = () => {
    if (!userProfile) {
      alert(t.alertLoadingProfile);
      return;
    }

    const missingFields: string[] = [];

    Object.keys(REQUIRED_PROFILE_FIELDS).forEach((field) => {
      const value = userProfile[field as keyof UserProfile];

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
        `${t.alertMissingFieldsTitle}\n\n${t.alertMissingFieldsGuide}\n\n${t.alertMissingFieldsRequired}\n${missingFields.join("\n")}`,
      );
      return;
    }

    recommendMutation();
  };

  const { mutate: reRecommendMutation, isPending: reRecommendPending } =
    useReRecommendMeal({
      onSuccessCallback: () => {
        setFeedbackModalVisible(false);
        setUserFeedback("");
      },
    });

  const handleConfirmReRecommend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFeedback.trim()) {
      alert(t.alertFeedbackEmpty);
      return;
    }
    reRecommendMutation(userFeedback.trim());
  };

  const isGlobalLoading = recommendPending || reRecommendPending;

  if (isGlobalLoading || isTodayLoading || isProfileLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-sm font-bold text-gray-600 animate-pulse">
            {isGlobalLoading ? t.loadingGlobal : t.loadingToday}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#F8FAFC]">
      <header className="h-16 shrink-0 bg-white border-b border-gray-100 shadow-md flex items-center justify-between px-8 shadow-gray-50/10">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <LayoutDashboard size={16} />
          <span className="text-gray-800 text-base font-extrabold">
            {t.headerTitle}
          </span>
        </div>

        {menuList.length > 0 && (
          <button
            onClick={() => setFeedbackModalVisible(true)}
            className="flex items-center gap-2 text-[14px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-400 px-4 py-2 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm shadow-emerald-100 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>{t.reRecommendButton}</span>
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
                          <span className="text-sm font-bold ml-1">
                            {t.kcal}
                          </span>
                        </span>
                      </div>
                    </div>

                    <h3 className="text-[22px] font-bold text-gray-800 tracking-tight leading-snug min-h-[56px] flex items-center">
                      {item.menu_name}
                    </h3>

                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl mb-8 text-center">
                      <div>
                        <div className="text-[13px] font-bold text-gray-400">
                          {t.carbs}
                        </div>
                        <div className="text-lg font-black text-amber-500 mt-0.5">
                          {item.carbohydrates}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-400">
                          {t.protein}
                        </div>
                        <div className="text-lg font-black text-emerald-500 mt-0.5">
                          {item.protein}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-400">
                          {t.fat}
                        </div>
                        <div className="text-lg font-black text-blue-500 mt-0.5">
                          {item.fat}g
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600/90">
                        <BookOpen size={14} />
                        <span>{t.recipeGuide}</span>
                      </div>
                      <div className="text-sm text-gray-600/95 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 max-h-[140px] overflow-y-auto whitespace-pre-line">
                        {item.recipe ? item.recipe.trim() : t.recipePreparing}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleZMartLink(item.menu_name)}
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-400 text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <span>{t.zmartShop}</span> <ShoppingCartIcon size={14} />
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
            <h3 className="text-lg font-black text-gray-800">{t.emptyTitle}</h3>
            <p className="text-xs font-medium text-gray-400 mt-2 leading-relaxed whitespace-pre-line">
              {t.emptySubtitle}
            </p>

            <button
              onClick={handleMealRecommend}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-400/20 transform active:scale-98 cursor-pointer"
            >
              <span>{t.recommendButton}</span>
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
              <h3>{t.modalTitle}</h3>
            </div>
            <p className="text-sm font-medium text-gray-500 leading-normal mb-5">
              {t.modalSubtitle}
            </p>

            <form onSubmit={handleConfirmReRecommend} className="space-y-5">
              <textarea
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder={t.modalPlaceholder}
                maxLength={120}
                autoFocus
                className="w-full h-24 bg-gray-50 border border-gray-200 focus:border-emerald-300 focus:outline-none p-4 rounded-xl text-[15px] font-medium resize-none transition-all placeholder:text-gray-400/80 text-gray-900"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackModalVisible(false)}
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 text-[15px] font-bold py-3 rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-950 text-white text-[15px] font-bold py-3 rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{t.submit}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
