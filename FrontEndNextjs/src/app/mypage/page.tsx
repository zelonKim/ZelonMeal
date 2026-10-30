"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  User as UserIcon,
  Mail,
  Calendar,
  Check,
  Save,
  Smile,
  Activity,
  Heart,
  RotateCw,
} from "lucide-react";

import { getMealDayCount } from "@/utils/getMealDayCount";
import { getUserProfile } from "@/api/user/getUserProfile";
import { useUpdateProfileMutation } from "@/hooks/useUpdateProfileMutation";
import { useUpdateNicknameMutation } from "@/hooks/useUpdateNicknameMutation";
import { useMyPageLanguage } from "@/hooks/languages/useMyPageLanguage";

export default function MyPageScreen() {
  const [newUsername, setNewUsername] = useState("");
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);

  const { t, locale } = useMyPageLanguage();

  // 다국어가 적용된 성별 선택지 배열
  const genderChoices = [
    { label: t.genders.M, value: "M" },
    { label: t.genders.F, value: "F" },
  ];

  // 다국어가 적용된 식단 목적 선택지 배열
  const purposeChoices = [
    { label: t.purposes.LOSS, value: "LOSS" },
    { label: t.purposes.MAINTAIN, value: "MAINTAIN" },
    { label: t.purposes.GAIN, value: "GAIN" },
    { label: t.purposes.HEALTH, value: "HEALTH" },
  ];

  // 다국어가 적용된 선호 식단 스타일 선택지 배열
  const mealStyleChoices = [
    { label: t.mealStyles.KOREAN, value: "KOREAN" },
    { label: t.mealStyles.WESTERN, value: "WESTERN" },
    { label: t.mealStyles.MIXED, value: "MIXED" },
  ];

  const [userInfo, setUserInfo] = useState({
    email: "",
    username: "",
    age: "",
    gender: "M",
    current_weight: "",
    goal_weight: "",
    purpose: "LOSS",
    meal_style: "MIXED",
    disease: "",
    allergies: "",
    created_at: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (profileData) {
      queueMicrotask(() => {
        setUserInfo({
          email: profileData.email || "",
          username: profileData.username || "",
          age: String(profileData.age || ""),
          gender: profileData.gender || "M",
          current_weight: String(profileData.current_weight || ""),
          goal_weight: String(profileData.goal_weight || ""),
          purpose: profileData.purpose || "LOSS",
          meal_style: profileData.meal_style || "MIXED",
          disease: profileData.disease || "",
          allergies: profileData.allergies || "",
          created_at: profileData.created_at || "",
        });
      });
    }
  }, [profileData]);

  const { mutate: updateProfileMutation, isPending: updateProfilePending } =
    useUpdateProfileMutation();

  const { mutate: updateNicknameMutation, isPending: updateNicknamePending } =
    useUpdateNicknameMutation({
      onSuccessCallback: () => setNicknameModalVisible(false),
    });

  if (profileLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] min-h-[500px]">
        <RotateCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-500 animate-pulse">
          {t.loadingProfile}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8FAFC] p-8 max-w-5xl w-full mx-auto space-y-8 antialiased">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-[28px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xs">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-700/5">
            <UserIcon size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-emerald-600 tracking-tight">
                {userInfo.username || t.noName}
              </h2>
              <span className="text-sm font-bold text-emerald-600">
                {t.suffixNim}
              </span>
              <button
                onClick={() => {
                  setNewUsername(userInfo.username);
                  setNicknameModalVisible(true);
                }}
                className="cursor-pointer text-[11px] font-black bg-white hover:bg-gray-100 border border-emerald-200 text-emerald-600 px-2.5 py-1 rounded-lg ml-2 transition-all shadow-xs"
              >
                {t.changeNickname}
              </button>
            </div>
            <p className="text-sm font-medium text-emerald-600 mt-1.5 flex items-center gap-1">
              <Mail size={12} /> {userInfo.email || t.noEmail}
            </p>
          </div>
        </div>

        <div className="md:mb-10 bg-emerald-600 shadow-lg text-white font-black text-[13px] px-4 py-1 rounded-lg shadow-emerald-500/10 self-start md:self-auto flex items-center gap-1.5">
          <Calendar size={15} />
          <span>{getMealDayCount(userInfo.created_at, locale)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3">
            <Smile size={16} className="text-emerald-500" />
            <span className="text-gray-800">{t.basicInfoTitle}</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-400 pl-1">
                {t.ageLabel}
              </label>
              <input
                type="number"
                value={userInfo.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="w-full bg-gray-50 text-[15px] font-semibold p-3 rounded-xl border border-gray-200/60 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-400 pl-1">
                {t.genderLabel}
              </label>
              <div className="grid grid-cols-2 gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/40">
                {genderChoices.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => handleInputChange("gender", choice.value)}
                    className={`cursor-pointer py-2 text-sm font-bold rounded-lg transition-all ${
                      userInfo.gender === choice.value
                        ? "bg-white text-emerald-600 border border-emerald-300 shadow-sm font-extrabold"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-400 pl-1">
                {t.currentWeightLabel}
              </label>
              <input
                type="number"
                step="0.1"
                value={userInfo.current_weight}
                onChange={(e) =>
                  handleInputChange("current_weight", e.target.value)
                }
                className="w-full bg-gray-50 text-[15px] font-semibold p-3 rounded-xl border border-gray-200/60 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-400 pl-1">
                {t.goalWeightLabel}
              </label>
              <input
                type="number"
                step="0.1"
                value={userInfo.goal_weight}
                onChange={(e) =>
                  handleInputChange("goal_weight", e.target.value)
                }
                className="w-full bg-gray-50 text-[15px] font-semibold p-3 rounded-xl border border-gray-200/60 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-gray-800">{t.purposeTitle}</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {purposeChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => handleInputChange("purpose", choice.value)}
                className={`cursor-pointer p-4 text-[15px] font-bold rounded-xl border text-center flex items-center justify-center gap-1.5 transition-all ${
                  userInfo.purpose === choice.value
                    ? "bg-emerald-500 border-emerald-500 text-white font-black shadow-md shadow-emerald-500/10"
                    : "bg-gray-50 border-gray-200/60 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {userInfo.purpose === choice.value && (
                  <Check size={14} strokeWidth={3} />
                )}
                <span>{choice.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3">
            <UserIcon size={16} className="text-emerald-500" />
            <span className="text-gray-800">{t.mealStyleTitle}</span>
          </h3>
          <div className="flex flex-col gap-2">
            {mealStyleChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => handleInputChange("meal_style", choice.value)}
                className={`cursor-pointer w-full p-3.5 text-[15px] font-bold rounded-xl border text-left px-5 transition-all flex items-center justify-between ${
                  userInfo.meal_style === choice.value
                    ? "bg-emerald-50 border-emerald-300 text-emerald-600 font-extrabold"
                    : "bg-gray-50 border-gray-200/60 text-gray-500 hover:bg-gray-100/80"
                }`}
              >
                <span>{choice.label}</span>
                {userInfo.meal_style === choice.value && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3">
            <Heart size={16} className="text-emerald-500" />
            <span className="text-gray-800">{t.healthTitle}</span>
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-400 pl-1">
                {t.diseaseLabel}
              </label>
              <input
                type="text"
                value={userInfo.disease}
                placeholder={t.diseasePlaceholder}
                onChange={(e) => handleInputChange("disease", e.target.value)}
                className="w-full bg-gray-50 text-[15px] font-semibold p-3 rounded-xl border border-gray-200/60 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800 placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 pl-1">
                {t.allergiesLabel}
              </label>
              <input
                type="text"
                value={userInfo.allergies}
                placeholder={t.allergiesPlaceholder}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                className="w-full bg-gray-50 text-[15px] font-semibold p-3 rounded-xl border border-gray-200/60 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800 placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="pt-4 flex gap-4">
        <button
          onClick={() => updateProfileMutation(userInfo)}
          disabled={updateProfilePending}
          className="cursor-pointer flex-1 h-12 rounded-xl bg-emerald-400 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-400/10"
        >
          {updateProfilePending ? (
            <RotateCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span className="text-white text-[15px]">{t.saveButton}</span>
              <Save size={15} />
            </>
          )}
        </button>
      </footer>

      {nicknameModalVisible && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100/50 m-4">
            <h3 className="text-lg font-black text-gray-900 mb-1">
              {t.modalTitle}
            </h3>
            <p className="text-xs font-semibold text-gray-400 mb-4 leading-normal">
              {t.modalSubtitle}
            </p>

            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={t.modalPlaceholder}
              maxLength={15}
              autoFocus
              className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-300 focus:outline-none p-3.5 rounded-xl text-md font-semibold text-gray-800 mb-5 placeholder:text-gray-400/80"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setNicknameModalVisible(false)}
                className="cursor-pointer flex-1 bg-gray-50 border border-gray-200 text-gray-500 text-sm font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newUsername.trim()) {
                    alert(t.alertEmptyNickname);
                    return;
                  }
                  updateNicknameMutation(newUsername.trim());
                }}
                disabled={updateNicknamePending}
                className="cursor-pointer flex-1 bg-gray-950 text-white text-sm font-bold py-3 rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center"
              >
                {updateNicknamePending ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  t.complete
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
