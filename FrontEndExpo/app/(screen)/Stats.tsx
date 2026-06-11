import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar as DatePicker } from "react-native-calendars";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.42;

export default function StatScreen() {
  const flatListRef = useRef<FlatList>(null);
  const INITIAL_INDEX = 500;
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState("");

  const isAutoScrolling = useRef(false);

  const [dailyStats, setDailyStats] = useState({
    calories: 1850,
    carbs: 210,
    protein: 140,
    fat: 55,
  });

  const getTargetDate = (indexOffset: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (indexOffset - INITIAL_INDEX));
    return targetDate;
  };

  const getTargetDateString = (indexOffset: number) => {
    const targetDate = getTargetDate(indexOffset);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const date = String(targetDate.getDate()).padStart(2, "0");
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][
      targetDate.getDay()
    ];

    return `${year}년 ${month}월 ${date}일 (${dayOfWeek})`;
  };

  const getFormattedYYYYMMDD = (indexOffset: number) => {
    const d = getTargetDate(indexOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  };

  const handleOpenModal = () => {
    setTempSelectedDate(getFormattedYYYYMMDD(currentIndex));
    setIsModalVisible(true);
  };

  const handleDaySelect = (day: { dateString: string }) => {
    setTempSelectedDate(day.dateString);
  };

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

  const handleGoToToday = () => {
    if (currentIndex === INITIAL_INDEX) return;
    jumpToPage(INITIAL_INDEX);
  };

  const handleScroll = (e: any) => {
    if (isAutoScrolling.current) return;

    const offset = e.nativeEvent.contentOffset.x;
    const page = Math.floor((offset + width * 0.55) / width);

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

  useEffect(() => {
    const seed = currentIndex % 5;
    setDailyStats({
      calories: 1700 + seed * 60,
      carbs: 190 + seed * 10,
      protein: 125 + seed * 8,
      fat: 50 + seed * 3,
    });
  }, [currentIndex]);

  const jumpToPage = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx > INITIAL_INDEX) return;

    isAutoScrolling.current = true;
    setCurrentIndex(targetIdx);
    flatListRef.current?.scrollToIndex({ index: targetIdx, animated: true });
  };

  const virtualTimeline = Array.from(
    { length: INITIAL_INDEX + 1 },
    (_, i) => i,
  );
  const todayString = getFormattedYYYYMMDD(INITIAL_INDEX);

  const renderStatCard = ({ item }: { item: number }) => {
    const hasPastData = item > 0;
    const hasFutureData = item < INITIAL_INDEX;

    return (
      <View style={styles.cardPage}>
        <View style={styles.statCardWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 영양성분 섭취 총량</Text>
            <View style={styles.calorieBox}>
              <Text style={styles.calorieLabel}>총 섭취 칼로리</Text>
              <Text style={styles.calorieValue}>
                {dailyStats.calories} <Text style={styles.unitText}>kcal</Text>
              </Text>
            </View>

            <View style={styles.nutritionGrid}>
              <View style={styles.nutriRow}>
                <View style={styles.nutriMeta}>
                  <Text style={styles.nutriLabel}>🌾 탄수화물</Text>
                  <Text style={styles.nutriValue}>{dailyStats.carbs}g</Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressActive,
                      { width: "65%", backgroundColor: "#FBBF24" },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.nutriRow}>
                <View style={styles.nutriMeta}>
                  <Text style={styles.nutriLabel}>🍗 단백질</Text>
                  <Text style={[styles.nutriValue, { color: "#34D399" }]}>
                    {dailyStats.protein}g
                  </Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressActive,
                      { width: "85%", backgroundColor: "#34D399" },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.nutriRow}>
                <View style={styles.nutriMeta}>
                  <Text style={styles.nutriLabel}>🥑 지방</Text>
                  <Text style={styles.nutriValue}>{dailyStats.fat}g</Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressActive,
                      { width: "45%", backgroundColor: "#60A5FA" },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* 🛠️ 단순 View 구조에서 터치가 가능하도록 TouchableOpacity 매핑 기동! */}
          <View style={styles.swipeIndicatorRow}>
            {hasPastData && (
              <TouchableOpacity
                style={styles.indicatorBlock}
                activeOpacity={0.6}
                onPress={() => jumpToPage(item - 1)}
              >
                <ArrowLeft size={14} color="#9CA3AF" />
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
                <ArrowRight size={14} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

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
        data={virtualTimeline}
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
              maxDate={todayString}
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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    paddingTop: 20,
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
    backgroundColor: "#064E3B",
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
    height: CARD_HEIGHT,
    borderRadius: 24,
    padding: 24,
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
  },
  swipeIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  // 🛠️ 사용자가 터치하기 편하도록 가로/세로 여백 패딩을 부여했습니다.
  indicatorBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  indicatorDivider: {
    width: 1,
    height: 10,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4, // 패딩 영역 확대로 마진 폭 최적화 조정
  },
  swipeHintText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4B5563",
  },
  calorieBox: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  calorieLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  calorieValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
  },
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  nutritionGrid: {
    gap: 12,
  },
  nutriRow: {
    width: "100%",
  },
  nutriMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  nutriLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  nutriValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
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
