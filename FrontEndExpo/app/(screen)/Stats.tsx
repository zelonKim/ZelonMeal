import { getMealStats } from "@/api/meal/getMealStats";
import { height } from "@/constants/CARD_HEIGHT";
import { CARD_WIDTH, width } from "@/constants/CARD_WIDTH";
import { INITIAL_INDEX } from "@/constants/INITIAL_INDEX";
import { mealEmojiMap } from "@/constants/mealEmojiMap";
import { RECOMMENDED_NUTRITION } from "@/constants/recommendedNutrition";
import { TIME_LINE } from "@/constants/timeLine";
import { TODAY_STR } from "@/constants/todayString";
import { getFormattedYYYYMMDD } from "@/utils/getFormattedYYYYMMDD";
import { getTargetDateString } from "@/utils/getTargetDateString";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  DimensionValue,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar as DatePicker } from "react-native-calendars";

export default function StatScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState("");
  const isAutoScrolling = useRef(false);

  const currentFormattedDate = getFormattedYYYYMMDD(currentIndex);

  ////////////////////////////////////////////////////////////////

  const { data: mealStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dailyStats", currentFormattedDate],
    queryFn: () => getMealStats(currentFormattedDate),
    staleTime: 1000 * 60 * 5,
  });

  const handleOpenModal = () => {
    setTempSelectedDate(getFormattedYYYYMMDD(currentIndex));
    setIsModalVisible(true);
  };

  const handleDaySelect = (day: { dateString: string }) => {
    setTempSelectedDate(day.dateString);
  };

  ///////////////////////////////////////////////////////////////////

  const handleConfirmDate = () => {
    if (!tempSelectedDate) return;

    const selectedDate = new Date(tempSelectedDate);
    selectedDate.setHours(12, 0, 0, 0);

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const targetIdx = INITIAL_INDEX + diffDays;

    if (targetIdx > INITIAL_INDEX) return;

    jumpToPage(targetIdx);
    setIsModalVisible(false);
  };

  ///////////////////////////////////////////////////////////////////

  const handleGoToToday = () => {
    if (currentIndex === INITIAL_INDEX) return;
    jumpToPage(INITIAL_INDEX);
  };

  ///////////////////////////////////////////////////////////////////

  const handleScroll = (e: any) => {
    if (isAutoScrolling.current) return;

    const offset = e.nativeEvent.contentOffset.x;
    const page = Math.round(offset / width);

    if (page !== currentIndex && page >= 0 && page <= INITIAL_INDEX) {
      setCurrentIndex(page);
    }
  };

  const handleMomentumScrollEnd = () => {
    isAutoScrolling.current = false;
  };

  const handleScrollAnimationEnd = () => {
    isAutoScrolling.current = false;
  };

  //////////////////////////////////////////////////////////////////////////

  const jumpToPage = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx > INITIAL_INDEX) return;
    isAutoScrolling.current = true;
    setCurrentIndex(targetIdx);
    flatListRef.current?.scrollToIndex({ index: targetIdx, animated: true });
  };

  //////////////////////////////////////////////////////////////////////////

  const getProgressWidth = (
    current: number | undefined | null,
    goal: number,
  ): DimensionValue => {
    const safeCurrent = current ?? 0;
    if (safeCurrent <= 0 || !goal) return "0%";

    const percentage = Math.min((safeCurrent / goal) * 100, 100);
    return `${percentage}%`;
  };


  //////////////////////////////////////////////////////////////////////////

  const renderStatCard = ({ item }: { item: number }) => {
    const hasPastData = item > 0;
    const hasFutureData = item < INITIAL_INDEX;
    const isCurrent = item === currentIndex;

    const calories = isCurrent ? Number(mealStats?.calories ?? 0) : 0;
    const carbs = isCurrent ? Number(mealStats?.carbohydrates ?? 0) : 0;
    const protein = isCurrent ? Number(mealStats?.protein ?? 0) : 0;
    const fat = isCurrent ? Number(mealStats?.fat ?? 0) : 0;

    const menuNames = isCurrent ? mealStats?.menu_names || [] : [];

    return (
      <View style={styles.cardPage}>
        <View style={styles.statCardWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 영양성분 섭취 총량</Text>

            {isCurrent && statsLoading ? (
              <View style={styles.cardCenterLoading}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.inlineLoadingText}>
                  데이터를 불러오는 중...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.calorieBox}>
                  <Text style={styles.calorieLabel}>총 섭취 칼로리</Text>
                  <Text style={styles.calorieValue}>
                    {calories} <Text style={styles.unitText}>kcal</Text>
                  </Text>
                </View>

                <View style={styles.nutritionGrid}>
                  <View style={styles.nutriRow}>
                    <View style={styles.nutriMeta}>
                      <Text style={styles.nutriLabel}>🌾 탄수화물</Text>
                      <Text style={styles.nutriValue_C}>{carbs}g</Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressActive,
                          {
                            width: getProgressWidth(
                              carbs,
                              RECOMMENDED_NUTRITION.carbs,
                            ),
                            backgroundColor: "#FBBF24",
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.nutriRow}>
                    <View style={styles.nutriMeta}>
                      <Text style={styles.nutriLabel}>🍗 단백질</Text>
                      <Text style={[styles.nutriValue, { color: "#34D399" }]}>
                        {protein}g
                      </Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressActive,
                          {
                            width: getProgressWidth(
                              protein,
                              RECOMMENDED_NUTRITION.protein,
                            ),
                            backgroundColor: "#34D399",
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.nutriRow}>
                    <View style={styles.nutriMeta}>
                      <Text style={styles.nutriLabel}>🥑 지방</Text>
                      <Text style={styles.nutriValue_F}>{fat}g</Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressActive,
                          {
                            width: getProgressWidth(
                              fat,
                              RECOMMENDED_NUTRITION.fat,
                            ),
                            backgroundColor: "#60A5FA",
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.menuHistoryCard}>
            <Text style={styles.menuHistoryTitle}>📋 섭취 식단 리스트</Text>

            {isCurrent && statsLoading ? (
              <View style={styles.menuHorizontalLoadingBox}>
                <ActivityIndicator size="small" color="#10B981" />
              </View>
            ) : menuNames.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {menuNames.map((menu: any, index: number) => (
                  <View key={index} style={styles.menuItemBadge}>
                    <Text style={styles.menuItemTimeText}>
                      {mealEmojiMap[menu.meal_time] || menu.meal_time}
                    </Text>
                    <Text style={styles.menuItemNameText} numberOfLines={1}>
                      {menu.menu_name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyMenuBox}>
                <Text style={styles.emptyMenuText}>
                  해당 날짜의 식단 기록이 없습니다.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.swipeIndicatorRow}>
            {hasPastData && (
              <TouchableOpacity
                style={styles.indicatorBlock}
                activeOpacity={0.6}
                onPress={() => jumpToPage(item - 1)}
              >
                <ArrowLeft size={13} color={"#18cf92"} />
                <Text style={styles.swipeHintText}>이전일</Text>
              </TouchableOpacity>
            )}

            {hasPastData && hasFutureData && (
              <View style={styles.indicatorDivider} />
            )}

            {hasFutureData && (
              <TouchableOpacity
                style={styles.indicatorBlock}
                activeOpacity={0.6}
                onPress={() => jumpToPage(item + 1)}
              >
                <Text style={styles.swipeHintText}>다음일</Text>
                <ArrowRight size={13} color={"#18cf92"} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  //////////////////////////////////////////////////////////////////////////

  return (
    <View style={styles.mainContainer}>
      <View style={styles.dateHeaderContainer}>
        <TouchableOpacity
          style={styles.dateCenterBadge}
          activeOpacity={0.7}
          onPress={handleOpenModal}
        >
          <CalendarIcon size={16} color="#064E3B" style={{ marginRight: 6 }} />
          <Text style={styles.dateText}>
            {getTargetDateString(currentIndex)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.todayButton}
          activeOpacity={0.7}
          onPress={handleGoToToday}
        >
          <Text style={styles.todayButtonText}>오늘</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={TIME_LINE}
        renderItem={renderStatCard}
        keyExtractor={(item) => item.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollAnimationEnd={handleScrollAnimationEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        initialScrollIndex={INITIAL_INDEX}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View style={styles.bottomSpacer} />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CalendarDays size={20} color="#10B981" />
              <Text style={styles.modalTitle}>날짜 직접 선택</Text>
            </View>

            <DatePicker
              current={tempSelectedDate}
              onDayPress={handleDaySelect}
              maxDate={TODAY_STR}
              markedDates={{
                [tempSelectedDate]: {
                  selected: true,
                  selectedColor: "#10B981",
                  selectedTextColor: "white",
                },
              }}
              theme={{
                textDayFontWeight: "600",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "500",
                todayTextColor: "#10B981",
                arrowColor: "#10B981",
              }}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmDate}
              >
                <Text style={styles.confirmButtonText}>선택 완료</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

//////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 28 : 38,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: CARD_WIDTH,
    marginBottom: 20,
    gap: 10,
  },
  dateCenterBadge: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#E6ECE8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#34D399",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#064E3B",
  },
  todayButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  todayButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  cardPage: {
    marginTop: Platform.OS === "ios" ? 25 : 45,
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  statCardWrapper: {
    flexDirection: "column",
    alignItems: "center",
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 3,
    height: height * 0.42,
  },
  cardCenterLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  inlineLoadingText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  menuHistoryCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 20,
    paddingVertical: 19,
    marginTop: 20,
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 2,
  },
  menuHistoryTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  horizontalScrollContent: {
    gap: 12,
  },
  menuItemBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  menuItemTimeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#6B7280",
    marginRight: 9,
  },
  menuItemNameText: {
    fontSize: 12,
    fontWeight: Platform.OS === "ios" ? "600" : "500",
    color: "#374151",
    maxWidth: width * 0.95,
  },
  menuHorizontalLoadingBox: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyMenuBox: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  emptyMenuText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  swipeIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    width: "100%",
  },
  indicatorBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 9,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  swipeHintText: {
    fontSize: 12,
    color: "#18cf92",
    fontWeight: Platform.OS === "ios" ? "600" : "500",
  },
  indicatorDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4B5563",
  },
  calorieBox: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginVertical: 6,
  },
  calorieLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 2,
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF4444",
  },
  unitText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },
  nutritionGrid: {
    gap: 10,
  },
  nutriRow: {
    width: "100%",
  },
  nutriMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 10 : 6,
    paddingHorizontal: 1,
  },
  nutriLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  nutriValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  nutriValue_C: { fontSize: 13, fontWeight: "bold", color: "#FBBF24" },
  nutriValue_F: { fontSize: 13, fontWeight: "bold", color: "#60A5FA" },
  progressBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressActive: {
    height: "100%",
    borderRadius: 4,
  },
  bottomSpacer: {
    height: 1,
    marginBottom: 130,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: width * 0.88,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
