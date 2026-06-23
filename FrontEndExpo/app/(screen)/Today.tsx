import { client } from "@/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import {
  BookOpen,
  Flame,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Utensils,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const REQUIRED_PROFILE_FIELDS: Record<string, string> = {
  age: "나이",
  current_weight: "현재 체중",
  goal_weight: "목표 체중",
  gender: "성별",
  purpose: "식단 관리 목적",
  meal_style: "선호 식단 스타일",
};

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.88;

const mealTimeMap: Record<string, string> = {
  BREAKFAST: "☀️ 아침 식사",
  LUNCH: "🍱 점심 식사",
  DINNER: "🌙 저녁 식사",
  SNACK: "🧁 간식 및 디저트",
};

interface MealItem {
  id: number;
  meal_time: string;
  meal_time_display: string;
  menu_name: string;
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  recipe: string;
}

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [userFeedback, setUserFeedback] = useState("");

  const { data: userProfile } = useQuery({
    queryKey: ["userProfileData"],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await client.get("/v1/users/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    retry: false,
  });

  // 1️⃣ [GET] 오늘의 식단 플랜 실시간 조회
  const { data: todayPlan, isLoading: isTodayLoading } = useQuery({
    queryKey: ["todayMealPlan"],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await client.get("/v1/meals/today/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    retry: false,
  });

  // 2️⃣ [POST] 최초 AI 추천 식단 생성 요청 연동
  const recommendMutation = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await client.post(
        "/v1/meals/recommend/",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["todayMealPlan"], data);
      setCurrentCardIndex(0);
      Alert.alert(
        "설계 완료",
        "성진님의 신체 스펙을 분석해 맞춤 식단을 구성했습니다! 🌱",
      );
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.detail ||
        "AI 식단을 생성하는 중 오류가 발생했습니다.";
      Alert.alert("추천 실패", errorMsg);
    },
  });

  // 3️⃣ [POST] 유저 피드백 기반 AI 식단 재추천 연동
  const reRecommendMutation = useMutation({
    mutationFn: async (feedback: string) => {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await client.post(
        "/v1/meals/rerecommend/",
        { user_feedback: feedback },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["todayMealPlan"], response.data);

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const date = String(today.getDate()).padStart(2, "0");
      const todayFormattedStr = `${year}-${month}-${date}`;

      queryClient.invalidateQueries({
        queryKey: ["dailyStats", todayFormattedStr],
      });
      setCurrentCardIndex(0);
      setFeedbackModalVisible(false);
      setUserFeedback("");
      Alert.alert(
        "재구성 완료",
        "피드백을 반영하여 오늘의 식단을 재구성 하였습니다!",
      );
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.detail || "식단 재추천 중 문제가 발생했습니다.";
      Alert.alert("재추천 실패", errorMsg);
    },
  });

  const handleZMartLink = async () => {
    const currentMenu = todayPlan?.menu_list?.[currentCardIndex];
    if (!currentMenu?.menu_name) {
      Alert.alert("알림", "검색할 메뉴 정보가 존재하지 않습니다.");
      return;
    }
    const encodedKeyword = encodeURIComponent(currentMenu.menu_name);

    const emartWebUrl = `https://m.ssg.com/search.ssg?query=${encodedKeyword}`;
    try {
      await Linking.openURL(emartWebUrl);
    } catch (err) {
      Alert.alert("Z마트 접속 실패");
    }
  };

  const handleMealRecommend = () => {
    // 1. 프로필 데이터를 조회하지 못했거나 통신 전일 때의 방어 가드
    if (!userProfile) {
      Alert.alert(
        "알림",
        "유저 프로필 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.",
      );
      return;
    }

    const missingFields: string[] = [];

    // 2. DjangoPayload의 필수 필드들을 돌면서 데이터가 비어있는지 체크
    Object.keys(REQUIRED_PROFILE_FIELDS).forEach((field) => {
      const value = userProfile[field];

      // 어제 먹은 식단 리스트(List[str])인 경우 배열이 비었거나 null인지 검사
      if (field === "yesterday_meals") {
        if (!value || !Array.isArray(value) || value.length === 0) {
          missingFields.push(REQUIRED_PROFILE_FIELDS[field]);
        }
      }
      // 그 외 일반 필드들의 null, undefined, 빈 문자열 유무 정밀 검사
      else {
        if (
          value === null ||
          value === undefined ||
          String(value).trim() === ""
        ) {
          missingFields.push(REQUIRED_PROFILE_FIELDS[field]);
        }
      }
    });

    if (missingFields.length > 0) {
      Alert.alert(
        "프로필 미입력",
        `AI가 맞춤 식단을 설계할 수 있도록 다음 항목을 입력해주세요!\n\n ⚠️ 필수 항목:\n- ${missingFields.join("\n- ")}\n\n`,
      );
      return;
    }

    recommendMutation.mutate();
  };

  const handleOpenFeedback = () => {
    setFeedbackModalVisible(true);
  };

  const handleConfirmReRecommend = () => {
    if (!userFeedback.trim()) {
      Alert.alert("입력 오류", "식단을 보완할 피드백 내용을 입력해주세요!");
      return;
    }
    reRecommendMutation.mutate(userFeedback.trim());
  };

  const handleScroll = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const page = Math.round(offset / width);
    const totalMenus = todayPlan?.menu_list?.length || 0;
    if (page >= 0 && page < totalMenus && page !== currentCardIndex) {
      setCurrentCardIndex(page);
    }
  };

  const renderMealCard = ({ item }: { item: MealItem }) => {
    const formatRecipe = (recipe: string | null) => {
      if (!recipe) return "레시피 정보가 없습니다.";
      const flattenedRecipe = recipe.replace(/[\r\n]+/g, " ").trim();
      return flattenedRecipe.replace(/(?!^)(?=\d+\.)/g, "\n");
    };

    return (
      <View style={styles.cardPage}>
        <View style={styles.mealCard}>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {mealTimeMap[item.meal_time] || item.meal_time_display}
              </Text>
            </View>
            <View style={styles.calorieTag}>
              <Flame size={14} color="#EF4444" style={{ marginRight: 2 }} />
              <Text style={styles.calorieText}>{item.calories} kcal</Text>
            </View>
          </View>

          <Text style={styles.mealTitle} numberOfLines={2}>
            {item.menu_name}
          </Text>

          <View style={styles.nutritionRow}>
            <View style={styles.nutriItem}>
              <Text style={styles.nutriLabel}>탄수화물</Text>
              <Text style={styles.nutriValue_C}>{item.carbohydrates}g</Text>
            </View>
            <View style={styles.nutriItem}>
              <Text style={styles.nutriLabel}>단백질</Text>
              <Text style={styles.nutriValue_P}>{item.protein}g</Text>
            </View>
            <View style={styles.nutriItem}>
              <Text style={styles.nutriLabel}>지방</Text>
              <Text style={styles.nutriValue_F}>{item.fat}g</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.recipeHeader}>
            <BookOpen size={15} color="#4B5563" style={{ marginRight: 4 }} />
            <Text style={styles.nutriTitle}>레시피 가이드</Text>
          </View>

          <View style={styles.recipeScrollContainer}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.mealDesc}>{formatRecipe(item.recipe)}</Text>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  const isGlobalLoading =
    recommendMutation.isPending || reRecommendMutation.isPending;
  if (isGlobalLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>
            AI가 오늘의 식단을 구성하고 있어요... 🥑
          </Text>
        </View>
      </View>
    );
  }

  if (isTodayLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>
            오늘의 식단을 불러오고 있어요... 🌱
          </Text>
        </View>
      </View>
    );
  }

  const menuList = todayPlan?.menu_list || [];

  return (
    <View style={styles.container}>
      {menuList.length > 0 ? (
        <View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity
              style={styles.ZmartCartBadge}
              activeOpacity={0.7}
              onPress={handleZMartLink}
            >
              <ShoppingCart
                size={15}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.ZmartBadgeText}>Z마트</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardContainer}>
            {/* 🌟 [구조 변경] 타이틀과 배민 B마트 퀵 버튼 인라인 일체형 배치 */}
            <View style={styles.titleHeaderInlineRow}>
              <Text style={styles.screenTitle}>🥑 오늘의 AI 추천 식단</Text>
            </View>

            <View style={styles.carouselWrapper}>
              <FlatList
                data={menuList}
                renderItem={renderMealCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
            </View>

            <View style={styles.dotContainer}>
              {menuList.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentCardIndex === index
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.reRecommendButton}
              activeOpacity={0.8}
              onPress={handleOpenFeedback}
            >
              <RefreshCw size={15} color="#064E3B" style={{ marginRight: 6 }} />
              <Text style={styles.reRecommendButtonText}>
                식단 다시 추천받기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Utensils size={32} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>오늘의 추천 식단이 아직 없어요</Text>
          <Text style={styles.emptySubtitle}>
            왼쪽 탭에서 나의 프로필을 저장하고, {"\n"} 정확한 식단을
            추천받아보세요.
          </Text>

          <TouchableOpacity
            style={styles.recommendButton}
            activeOpacity={0.8}
            onPress={handleMealRecommend}
          >
            <Text style={styles.buttonText}>AI 식단 추천받기 </Text>
            <Sparkles size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModalBox}>
            <Text style={styles.feedbackModalTitle}>🔄 보완할 내용</Text>
            <Text style={styles.feedbackModalSub}>
              현재 식단에서 보완할 내용을 알려주시면 AI가 식단을 다시
              추천해드려요!
            </Text>

            <TextInput
              style={styles.feedbackInput}
              value={userFeedback}
              onChangeText={setUserFeedback}
              placeholder="예:점심은 고기가 안들어가는 요리로 대체해줘"
              multiline
              numberOfLines={3}
              maxLength={120}
              textAlignVertical="top"
              autoFocus={true}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleConfirmReRecommend}
              >
                <Text style={styles.modalConfirmBtnText}>입력 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  titleHeaderInlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: CARD_WIDTH,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },

  ZmartCartBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
    marginRight: 24,
  },
  ZmartBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  carouselWrapper: {
    height: 430,
  },
  cardPage: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    width: CARD_WIDTH,
    height: "100%",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    ...Platform.select({
      ios: { elevation: 4, marginBottom: 3 },
      android: { elevation: 1, marginBottom: 6 },
    }),
  },
  tagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6ECE8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#064E3B",
  },
  calorieTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  calorieText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EF4444",
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    lineHeight: 28,
    marginTop: 12,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginTop: 16,
    marginBottom: 22,
  },
  recipeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  nutriTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4B5563",
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    borderRadius: 16,
    marginVertical: 8,
  },
  nutriItem: {
    alignItems: "center",
  },
  nutriLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 4,
  },
  nutriValue_C: { fontSize: 14, fontWeight: "bold", color: "#FBBF24" },
  nutriValue_F: { fontSize: 14, fontWeight: "bold", color: "#60A5FA" },
  nutriValue_P: { fontSize: 14, fontWeight: "bold", color: "#10B981" },
  emptyContainer: {
    flex: 1,
    marginTop: 200,
    alignItems: "center",
    paddingHorizontal: 30,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  recommendButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  dot: { height: 6, borderRadius: 3 },
  activeDot: { width: 12, backgroundColor: "#10B981" },
  inactiveDot: { width: 6, backgroundColor: "#D1D5DB" },
  recipeScrollContainer: {
    marginTop: 6,
    height: Platform.OS === "ios" ? 150 : 135,
    width: "100%",
  },
  scrollContent: {
    paddingRight: Platform.OS === "android" ? 14 : 8,
    paddingBottom: 4,
  },
  mealDesc: {
    color: "#6B7280",
    textAlignVertical: "top",
    ...Platform.select({
      ios: { fontSize: 13, lineHeight: 20 },
      android: { fontSize: 12, lineHeight: 20, includeFontPadding: false },
    }),
  },
  reRecommendButton: {
    flexDirection: "row",
    backgroundColor: "#E6ECE8",
    borderWidth: 1,
    borderColor: "#34D399",
    width: CARD_WIDTH,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  reRecommendButtonText: {
    color: "#064E3B",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackModalBox: {
    backgroundColor: "#FFFFFF",
    width: width * 0.86,
    borderRadius: 22,
    padding: 24,
    marginBottom: 80,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  feedbackModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  feedbackModalSub: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 16,
  },
  feedbackInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    height: 90,
    fontSize: 14,
    color: "#111827",
    marginBottom: 40,
  },
  modalButtonRow: { flexDirection: "row", gap: 10 },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtn: { backgroundColor: "#F3F4F6" },
  modalCancelBtnText: { color: "#4B5563", fontSize: 14, fontWeight: "600" },
  modalConfirmBtn: { backgroundColor: "#111827" },
  modalConfirmBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
});
