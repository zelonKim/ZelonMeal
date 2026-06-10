import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import MyPageScreen from "./MyPageScreen";
import StatsScreen from "./StatScreen";
import TodayScreen from "./TodayScreen";

export default function MainSwipeScreen() {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <PagerView
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {/* 🍱 PAGE 1: 오늘의 식단 */}
        <View key="1" style={[styles.page]}>
          <TodayScreen />
        </View>

        {/* 📊 PAGE 2: 식단 통계 */}
        <View key="2" style={[styles.page]}>
          <StatsScreen />
        </View>

        {/* 👤 PAGE 3: 마이페이지 */}
        <View key="3" style={[styles.page]}>
          <MyPageScreen />
        </View>
      </PagerView>

      <View style={styles.indicatorContainer}>
        <View
          style={[
            styles.dot,
            currentPage === 0 ? styles.activeDot : styles.inactiveDot,
          ]}
        />
        <View
          style={[
            styles.dot,
            currentPage === 1 ? styles.activeDot : styles.inactiveDot,
          ]}
        />
        <View
          style={[
            styles.dot,
            currentPage === 2 ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚨 [핵심] 앱 전체의 도화지가 되는 최상위 컨테이너 배경색을 지정합니다!
  container: {
    flex: 1,
    backgroundColor: Platform.select({
      ios: "#006A4E",
      android: "#006A4E",
    }),
  },
  pagerView: {
    flex: 1,
    // 💡 꿀팁: PagerView 자체의 배경을 투명하게(transparent) 해두면
    // container에 지정한 전체 배경색이 부드럽게 투영됩니다.
  },
  page: {
    flex: 1,
    // 개별 페이지도 투명하게 맞추면 전체 배경색과 통일됩니다!
  },

  // 인디케이터 고정 뷰 스타일 규칙
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: "#34D399",
    // borderWidth: 1,
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
    width: 10,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: "transparent",
    borderWidth: 1.2,
    borderColor: "#E5E7EB",
  },
});
