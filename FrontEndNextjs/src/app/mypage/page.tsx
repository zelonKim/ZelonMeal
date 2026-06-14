"use client";

import React, { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";

import {
  User as UserIcon,
  Mail,
  Calendar,
  Check,
  Save,
  LogOut,
  Smile,
  Activity,
  Heart,
  RotateCw,
} from "lucide-react";

// 🗂️ 셀렉트 옵션 메타 딕셔너리
const genderChoices = [
  { label: "남성", value: "M" },
  { label: "여성", value: "F" },
];

const purposeChoices = [
  { label: "다이어트", value: "LOSS" },
  { label: "체중 유지", value: "MAINTAIN" },
  { label: "벌크업", value: "GAIN" },
  { label: "건강 관리", value: "HEALTH" },
];

const mealStyleChoices = [
  { label: "한식 중심", value: "KOREAN" },
  { label: "양식 중심", value: "WESTERN" },
  { label: "혼합", value: "MIXED" },
];

export default function MyPageScreen() {
  const queryClient = useQueryClient();

  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("");

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

  // 1️⃣ [GET] 로그인한 유저 프로필 조회 API 연동 (쿠키 연동은 client.ts 인터셉터가 대행 🛡️)
  const { data, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await client.get("/v1/users/profile/");
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (data) {
      setUserInfo({
        email: data.email || "",
        username: data.username || "",
        age: String(data.age || ""),
        gender: data.gender || "M",
        current_weight: String(data.current_weight || ""),
        goal_weight: String(data.goal_weight || ""),
        purpose: data.purpose || "LOSS",
        meal_style: data.meal_style || "MIXED",
        disease: data.disease || "",
        allergies: data.allergies || "",
        created_at: data.created_at || "",
      });
    }
  }, [data]);

  // D-Day 일차수 계산 파이프라인
  const getMealDayCount = (createdAtStr: string) => {
    if (!createdAtStr) return "식단 1일차";
    try {
      const startDate = new Date(createdAtStr.split("T")[0]);
      const today = new Date();
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return `식단 ${diffDays > 0 ? diffDays : 1}일차`;
    } catch (e) {
      return "식단 1일차";
    }
  };

  // 2️⃣ [PATCH] 유저 신체 스펙 정보 수정 API
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: typeof userInfo) => {
      const payload = {
        age: updatedData.age ? parseInt(updatedData.age, 10) : null,
        gender: updatedData.gender,
        current_weight: updatedData.current_weight
          ? parseFloat(updatedData.current_weight)
          : null,
        goal_weight: updatedData.goal_weight
          ? parseFloat(updatedData.goal_weight)
          : null,
        purpose: updatedData.purpose,
        meal_style: updatedData.meal_style,
        disease: updatedData.disease,
        allergies: updatedData.allergies,
      };
      const response = await client.patch("/v1/users/profile/", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      alert("프로필 정보가 성공적으로 변경되었습니다! ");
    },
    onError: () => {
      alert("프로필 정보를 수정하는 중 오류가 발생했습니다.");
    },
  });

  // 3️⃣ [PATCH] 유저 닉네임 단독 수정 API
  const updateNicknameMutation = useMutation({
    mutationFn: async (newNickname: string) => {
      const response = await client.patch("/v1/users/profile/", {
        username: newNickname,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setNicknameModalVisible(false);
      alert("닉네임이 성공적으로 변경되었습니다! ✨");
    },
    onError: (error: any) => {
      const serverError =
        error.response?.data?.username?.[0] ||
        "닉네임 변경 중 오류가 발생했습니다.";
      alert(serverError);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] min-h-[500px]">
        <RotateCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-500 animate-pulse">
          유저 정보를 불러오고 있어요...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8FAFC] p-8 max-w-5xl w-full mx-auto space-y-8 antialiased">
      {/* 👑 와이드 프로필 배너 상단 카드 */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-[28px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xs">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-700/5">
            <UserIcon size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-emerald-600 tracking-tight">
                {userInfo.username || "이름 없음"}
              </h2>
              <span className="text-sm font-bold text-emerald-600 ">님</span>
              <button
                onClick={() => {
                  setNewUsername(userInfo.username);
                  setNicknameModalVisible(true);
                }}
                className="text-[11px] font-black bg-white hover:bg-emerald-200 border border-emerald-200 text-emerald-600 px-2.5 py-1 rounded-lg ml-2 transition-all shadow-xs"
              >
                닉네임 수정
              </button>
            </div>
            <p className="text-[13px] font-medium text-emerald-600  mt-1.5 flex items-center gap-1">
              <Mail size={12} /> {userInfo.email || "이메일 정보 없음"}
            </p>
          </div>
        </div>

        {/* 디데이 그린 엠블럼 플래그 */}
        <div className=" md:mb-10 bg-emerald-600 shadow-lg text-white font-black text-sm px-4 py-1 rounded-lg  shadow-emerald-500/10 self-start md:self-auto flex items-center gap-1.5">
          <Calendar size={15} />
          <span>{getMealDayCount(userInfo.created_at)}</span>
        </div>
      </div>

      {/* ⚙️ 메인 스펙 컨트롤 보드 세팅 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 가드 1: 기본 신체 스펙 보드 */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-md font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3">
            <Smile size={16} className="text-emerald-500" />
            <span className="text-gray-800">기본 신체 정보</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-400 pl-1">
                만 나이 (세)
              </label>
              <input
                type="number"
                value={userInfo.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="w-full  bg-gray-50 text-[15px] font-semibold p-3 rounded-xl border border-gray-200/60 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-400 pl-1">
                성별
              </label>
              <div className="grid grid-cols-2 gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/40">
                {genderChoices.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => handleInputChange("gender", choice.value)}
                    className={`py-2 text-[13px] font-bold rounded-lg transition-all ${
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
              <label className="text-[13px] font-bold text-gray-400 pl-1">
                현재 체중 (kg)
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
              <label className="text-[14px] font-bold text-gray-400 pl-1">
                목표 체중 (kg)
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

        {/* 가드 2: 식단 관리 타겟 목적 */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-md font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-gray-800">식단 관리 목적</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {purposeChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => handleInputChange("purpose", choice.value)}
                className={`p-4 text-sm font-bold rounded-xl border text-center flex items-center justify-center gap-1.5 transition-all ${
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

        {/* 가드 3: 선호 식단 스타일 셀렉트 */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-md font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3">
            <UserIcon size={16} className="text-emerald-500" />
            <span className="text-gray-800">선호 식단 스타일</span>
          </h3>
          <div className="flex flex-col gap-2">
            {mealStyleChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => handleInputChange("meal_style", choice.value)}
                className={`w-full p-3.5 text-sm font-bold rounded-xl border text-left px-5 transition-all flex items-center justify-between ${
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

        {/* 가드 4: 메디컬 특이 건강 보드 */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-md font-black text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-3">
            <Heart size={16} className="text-emerald-500" />
            <span className="text-gray-800">건강 특이사항</span>
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-gray-400 pl-1">
                보유 질환 내역
              </label>
              <input
                type="text"
                value={userInfo.disease}
                placeholder="예: 고혈압, 당뇨 등"
                onChange={(e) => handleInputChange("disease", e.target.value)}
                className="w-full bg-gray-50 text-sm font-semibold p-3 rounded-xl border border-gray-200/60 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800 placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-gray-400 pl-1">
                알레르기 유발 유무
              </label>
              <input
                type="text"
                value={userInfo.allergies}
                placeholder="예: 복숭아, 견과류 등"
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                className="w-full bg-gray-50 text-sm font-semibold p-3 rounded-xl border border-gray-200/60 focus:outline-none focus:border-emerald-400 focus:bg-white text-gray-800 placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 하단 액션 제어 트레이 컨트롤러 바 */}
      <footer className="pt-4 flex gap-4">
        <button
          onClick={() => updateProfileMutation.mutate(userInfo)}
          disabled={updateProfileMutation.isPending}
          className="flex-1 h-12 rounded-xl bg-emerald-400 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-400/10"
        >
          {updateProfileMutation.isPending ? (
            <RotateCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save size={16} />
              <span className="text-white">나의 정보 변경하기</span>
            </>
          )}
        </button>
      </footer>

      {/* ✏️ 웹 전용 닉네임 전용 오버레이 다이얼로그 모달 */}
      {nicknameModalVisible && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100/50 m-4">
            <h3 className="text-lg font-black text-gray-900 mb-1">
              ✏️ 닉네임 변경
            </h3>
            <p className="text-xs font-semibold text-gray-400 mb-4 leading-normal">
              ZelonMeal에서 사용할 새로운 닉네임을 입력해주세요.
            </p>

            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="닉네임 입력"
              maxLength={15}
              autoFocus
              className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-300 focus:outline-none p-3.5 rounded-xl text-md font-semibold text-gray-800 mb-5 placeholder:text-gray-400/80"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setNicknameModalVisible(false)}
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 text-sm font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newUsername.trim()) {
                    alert("닉네임을 최소 한 글자 이상 채워주세요!");
                    return;
                  }
                  updateNicknameMutation.mutate(newUsername.trim());
                }}
                disabled={updateNicknameMutation.isPending}
                className="flex-1 bg-gray-950 text-white text-sm font-bold py-3 rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center"
              >
                {updateNicknameMutation.isPending ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  "변경 완료"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
