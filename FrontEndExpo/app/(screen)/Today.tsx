import { client } from "@/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { BookOpen, Flame, Sparkles, Utensils } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform, // 🌟 OS 구분을 위해 추가
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.88;

// 📝 장고 Choice 값 한글 변환용 딕셔너리
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

  // ------------------------------------------
  // 1️⃣ [GET] 오늘의 식단 플랜이 이미 존재하는지 실시간 조회
  // ------------------------------------------
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

  // ------------------------------------------
  // 2️⃣ [POST] AI 추천 식단 생성 요청 연동
  // ------------------------------------------
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
        "성진님의 신체 스펙과 섭취 패턴을 분석해 맞춤 식단을 구성했습니다! 🌱",
      );
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.detail ||
        "AI 식단을 생성하는 중 오류가 발생했습니다.";
      Alert.alert("추천 실패", errorMsg);
    },
  });

  const handleMealRecommend = () => {
    recommendMutation.mutate();
  };

  const handleScroll = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const page = Math.round(offset / width);
    const totalMenus = todayPlan?.menu_list?.length || 0;
    if (page >= 0 && page < totalMenus && page !== currentCardIndex) {
      setCurrentCardIndex(page);
    }
  };

  // 아침, 점심, 저녁, 간식 개별 카드 렌더링 함수
  // 아침, 점심, 저녁, 간식 개별 카드 렌더링 함수
  const renderMealCard = ({ item }: { item: MealItem }) => {
    const formatRecipe = (recipe: string | null) => {
      if (!recipe) return "레시피 정보가 없습니다.";
      const trimmedRecipe = recipe.trim();

      return Platform.select({
        ios: () => {
          return trimmedRecipe.replace(/(?!^)(?=\d+\.)/g, "\n");
        },
        android: () => {
          return trimmedRecipe;
        },
        default: () => trimmedRecipe,
      })();
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

          {/* 📊 영양소 탄·단·지 대시보드 */}
          <View style={styles.nutritionRow}>
            <View style={styles.nutriItem}>
              <Text style={styles.nutriLabel}>탄수화물</Text>
              <Text style={styles.nutriValue}>{item.carbohydrates}g</Text>
            </View>
            <View style={styles.nutriItem}>
              <Text style={styles.nutriLabel}>단백질</Text>
              <Text style={styles.nutriValue_P}>{item.protein}g</Text>
            </View>
            <View style={styles.nutriItem}>
              <Text style={styles.nutriLabel}>지방</Text>
              <Text style={styles.nutriValue}>{item.fat}g</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 🍳 AI 추천 레시피 가이드라인 */}
          <View style={styles.recipeHeader}>
            <BookOpen size={15} color="#4B5563" style={{ marginRight: 4 }} />
            <Text style={styles.nutriTitle}>레시피 가이드</Text>
          </View>

          {/* 🌟 레시피 가이드 스크롤 영역 */}
          <View style={styles.recipeScrollContainer}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              // contentContainerStyle에서 여백 밀림 현상 방어
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.mealDesc}>{formatRecipe(item.recipe)}</Text>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  // 로딩 디펜스 가드

  if (recommendMutation.isPending) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>
            AI가 오늘의 식단을 설계하고 있어요... 🥦
          </Text>
        </View>
      </View>
    );
  }

  if (isTodayLoading) {
    return (
      <View style={styles.container}>
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
        <View style={styles.cardContainer}>
          <Text style={styles.screenTitle}>🥑 오늘의 AI 추천 식단</Text>

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
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Utensils size={32} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>오늘의 추천 식단이 아직 없어요</Text>
          <Text style={styles.emptySubtitle}>
            AI에게 오늘의 추천 식단을 요청해 보세요!
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -24,
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
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingLeft: width * 0.06 + 4,
  },
  carouselWrapper: {
    height: 430, // 🚀 스크롤 및 간격 확보를 위해 높이 400 -> 420으로 미세 확장
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
      ios: {
        elevation: 4,
        marginBottom: 3,
      },
      android: {
        elevation: 1,
        marginBottom: 6,
      },
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
    marginVertical: 4,
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
    marginBottom: 4,
  },
  nutriValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  nutriValue_P: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 12,
    backgroundColor: "#10B981",
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "#D1D5DB",
  },

  recipeScrollContainer: {
    marginTop: 9,
    // iOS와 안드로이드 모두에서 카드가 깨지지 않는 고정형 절대 높이 가이드라인으로 교체!
    height: Platform.OS === "ios" ? 150 : 135,
    width: "100%",
  },

  // 🌟 [신규] 스크롤 뷰 내부 내용물이 바닥에 딱 달라붙지 않고 정돈되게 다듬는 컨테이너 핏
  scrollContent: {
    paddingRight: Platform.OS === "android" ? 14 : 8,
    paddingBottom: 4, // 하단 유령 마진을 유발하던 과도한 패딩 전면 축소
  },

  mealDesc: {
    color: "#6B7280",

    textAlignVertical: "top",

    ...Platform.select({
      ios: {
        fontSize: 13,
        lineHeight: 22,
      },
      android: {
        fontSize: 12,
        lineHeight: 21,
        includeFontPadding: false,
      },
    }),
  },
});
