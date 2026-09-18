import { ChartColumnIncreasing, User, Utensils } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MyPage from "./MyPage";
import Stats from "./Stats";
import Today from "./Today";

const { width } = Dimensions.get("window");

export default function MainSwipeScreen() {
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
      <View style={styles.contentArea}>{renderScreen()}</View>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={[
            styles.floatingButton,
            currentScreen === 1 && styles.activeButton,
          ]}
          activeOpacity={0.7}
          onPress={() => setCurrentScreen(1)}
        >
          <User size={22} color={currentScreen === 1 ? "#FFFFFF" : "#4B5563"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.floatingButton,
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

/////////////////////////////////////////////////////////


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  contentArea: {
    flex: 1,
  },
  floatingButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: width * 0.06,
    pointerEvents: "box-none",
    ...Platform.select({
      ios: {
        bottom: 38,
      },
      android: {
        bottom: 75,
      },
    }),
  },
  floatingButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  activeButton: {
    backgroundColor: "#34D399",
    shadowColor: "#34D399",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});
