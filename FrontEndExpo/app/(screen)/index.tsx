import { ChartColumnIncreasing, User, Utensils } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MyPage from "./MyPage";
import Stats from "./Stats";
import Today from "./Today";

const { width } = Dimensions.get("window");

export default function MainSwipeScreen() {
  // 💡 현재 보여줄 화면 상태 (0: 오늘의식단, 1: 마이페이지, 2: 식단통계)
  const [currentScreen, setCurrentScreen] = useState(0);

  const renderScreen = () => {
    switch (currentScreen) {
      case 0:
        return <Today />;
      case 1:
        return <MyPage />;
      case 2:
        return <Stats />;
      default:
        return <Today />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 📱 메인 콘텐츠 영역 (선택된 스크린이 보임) */}
      <View style={styles.contentArea}>{renderScreen()}</View>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={[
            styles.floatingButton,
            currentScreen === 1 && styles.activeButton,
          ]}
          activeOpacity={0.7}
          onPress={() => setCurrentScreen(1)} // 무조건 마이페이지로
        >
          <User size={22} color={currentScreen === 1 ? "#FFFFFF" : "#4B5563"} />
        </TouchableOpacity>

        {/* 🍱 2. 중앙 버튼: 오늘의 식단(메인 홈)으로 복귀 */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            // styles.centerButton, // 중앙 버튼은 시각적 안정감을 위해 살짝 다르게 연출 가능
            currentScreen === 0 && styles.activeButton,
          ]}
          activeOpacity={0.7}
          onPress={() => setCurrentScreen(0)}
        >
          <Utensils
            size={22}
            color={currentScreen === 0 ? "#FFFFFF" : "#4B5563"}
          />
        </TouchableOpacity>

        {/* 📊 3. 오른쪽 버튼: 식단 통계로 이동 */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            currentScreen === 2 && styles.activeButton,
          ]}
          activeOpacity={0.7}
          onPress={() => setCurrentScreen(2)}
        >
          <ChartColumnIncreasing
            size={22}
            color={currentScreen === 2 ? "#FFFFFF" : "#4B5563"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // 👈 정석 연회색 배경!
  },
  contentArea: {
    flex: 1,
  },

  // 🟢 플로팅 버튼 3개를 화면 중앙 하단에 이쁘게 모아주는 컨테이너
  floatingButtonContainer: {
    position: "absolute",
    bottom: 50, // 하단에서 여유 있게 띄움
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: width * 0.06, // 💡 디바이스 너비 비례 쫀쫀한 간격 (약 20~25px 내외)
    pointerEvents: "box-none", // 버튼 영역 외 터치가 씹히는 RN 버그 방지 가드
  },

  // 동글동글하고 입체감 넘치는 플로팅 버튼 기본 스타일 (기본 흰색)
  floatingButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",

    // 🔥 버튼이 화면 위에 둥둥 떠 있는 느낌을 주는 고급 그림자 효과
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  // 🌟 활성화되었을 때 변신할 스타일 (민트 그린으로 가득 채우기!)
  activeButton: {
    backgroundColor: "#34D399",
    shadowColor: "#34D399", // 그림자도 민트빛 후광으로 번지게 연출
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});
