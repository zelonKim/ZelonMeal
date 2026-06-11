import { client } from "@/api/client"; // 🌐 Axios 인스턴스
import { useAuth } from "@/app/_layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // 🔄 상태 관리 3총사
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Check,
  Edit2,
  LogOut,
  Save,
  User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = Platform.select({
  ios: height * 0.33,
  android: height * 0.38,
  default: height * 0.4,
});

export default function MyPageScreen() {
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { checkAuthStatus } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

  const [userInfo, setUserInfo] = useState({
    email: "",
    age: "",
    gender: "M",
    current_weight: "",
    goal_weight: "",
    purpose: "LOSS",
    meal_style: "MIXED",
    disease: "",
    allergies: "",
  });

  // ------------------------------------------
  // 1️⃣ [GET] 로그인한 유저 프로필 조회 API 연동
  // ------------------------------------------
  const { isLoading, isError } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await client.get("/v1/users/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const queryData = queryClient.getQueryData<any>(["userProfile"]);

  useEffect(() => {
    if (queryData) {
      setUserInfo({
        email: queryData.email || "알 수 없는 유저",
        age: String(queryData.age || ""),
        gender: queryData.gender || "M",
        current_weight: String(queryData.current_weight || ""),
        goal_weight: String(queryData.goal_weight || ""),
        purpose: queryData.purpose || "LOSS",
        meal_style: queryData.meal_style || "MIXED",
        disease: queryData.disease || "",
        allergies: queryData.allergies || "",
      });
    }
  }, [queryData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: typeof userInfo) => {
      const token = await SecureStore.getItemAsync("userToken");

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

      const response = await client.patch("/v1/users/profile/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      Alert.alert("저장 완료", "유저 정보가 성공적으로 변경되었습니다! ");
    },
    onError: () => {
      Alert.alert(
        "저장 실패",
        "프로필 정보를 수정하는 중 오류가 발생했습니다.",
      );
    },
  });

  const handleSaveChanges = () => {
    updateProfileMutation.mutate(userInfo);
  };

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

  const handleInputChange = (field: string, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleScroll = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const page = Math.round(offset / width);
    if (page >= 0 && page <= 3 && page !== currentStep) {
      setCurrentStep(page);
    }
  };

  const handleChangeNickname = () => {
    setMenuVisible(false);
    Alert.prompt(
      "닉네임 변경",
      "새로운 닉네임 또는 이메일을 입력하세요.",
      [{ text: "취소", style: "cancel" }, { text: "변경" }],
      "plain-text",
      userInfo.email,
    );
  };

  const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        style: "destructive",
        onPress: async () => {
          try {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("refreshToken");
            await checkAuthStatus();
            router.push("/(auth)/login");
          } catch (e) {
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const stepsData = [0, 1, 2, 3];

  // 로딩 및 에러 스크린 디펜스
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>유저 정보를 불러오는 중...</Text>
      </View>
    );
  }

  const renderCardItem = ({ item }: { item: number }) => {
    return (
      <View style={styles.cardPage}>
        <View style={styles.card}>
          {item === 0 && (
            <View style={styles.cardInner}>
              <Text style={styles.cardTitle}>📊 기본 신체 스펙</Text>
              <View style={styles.cardContentGap}>
                <View style={styles.row}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>만 나이 (세)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={userInfo.age}
                      keyboardType="number-pad"
                      onChangeText={(val) => handleInputChange("age", val)}
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>성별</Text>
                    <View style={styles.chipGroup}>
                      {genderChoices.map((choice) => (
                        <TouchableOpacity
                          key={choice.value}
                          style={[
                            styles.chipButton,
                            userInfo.gender === choice.value &&
                              styles.activeChip,
                          ]}
                          onPress={() =>
                            handleInputChange("gender", choice.value)
                          }
                        >
                          <Text
                            style={[
                              styles.chipText,
                              userInfo.gender === choice.value &&
                                styles.activeChipText,
                            ]}
                          >
                            {choice.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>현재 체중 (kg)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={userInfo.current_weight}
                      keyboardType="decimal-pad"
                      onChangeText={(val) =>
                        handleInputChange("current_weight", val)
                      }
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>목표 체중 (kg)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={userInfo.goal_weight}
                      keyboardType="decimal-pad"
                      onChangeText={(val) =>
                        handleInputChange("goal_weight", val)
                      }
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {item === 1 && (
            <View style={styles.cardInner}>
              <Text style={styles.cardTitle}>🎯 식단 관리 목적</Text>
              <View style={styles.gridGroup}>
                {purposeChoices.map((choice) => (
                  <TouchableOpacity
                    key={choice.value}
                    style={[
                      styles.gridChip,
                      userInfo.purpose === choice.value &&
                        styles.activeGridChip,
                    ]}
                    onPress={() => handleInputChange("purpose", choice.value)}
                  >
                    {userInfo.purpose === choice.value && (
                      <Check
                        size={16}
                        color="#FFFFFF"
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.chipText,
                        userInfo.purpose === choice.value &&
                          styles.activeChipText,
                      ]}
                    >
                      {choice.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {item === 2 && (
            <View style={styles.cardInner}>
              <Text style={styles.cardTitle}>🍱 선호 식단 스타일</Text>
              <View style={styles.chipGroupFull}>
                {mealStyleChoices.map((choice) => (
                  <TouchableOpacity
                    key={choice.value}
                    style={[
                      styles.chipButtonFull,
                      userInfo.meal_style === choice.value && styles.activeChip,
                    ]}
                    onPress={() =>
                      handleInputChange("meal_style", choice.value)
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        userInfo.meal_style === choice.value &&
                          styles.activeChipText,
                      ]}
                    >
                      {choice.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {item === 3 && (
            <View style={styles.cardInner}>
              <Text style={styles.cardTitle}>⚠️ 건강 특이 사항</Text>
              <View style={styles.cardContentGap}>
                <View style={styles.fieldBlock}>
                  <Text style={styles.inputLabel}>지병 보유 내역</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={userInfo.disease}
                    multiline
                    placeholder="예: 고혈압, 당뇨 등"
                    onChangeText={(val) => handleInputChange("disease", val)}
                  />
                </View>
                <View style={styles.fieldBlock}>
                  <Text style={styles.inputLabel}>알레르기 유발 유무</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={userInfo.allergies}
                    multiline
                    placeholder="예: 계란, 대두, 땅콩 등"
                    onChangeText={(val) => handleInputChange("allergies", val)}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* 1. 프로필 헤더 영역 */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfoLeft}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <UserIcon size={26} color="#064E3B" />
          </TouchableOpacity>
          <View style={styles.headerTextSide}>
            <Text style={styles.emailText} numberOfLines={1}>
              {userInfo.email}
            </Text>
            <Text style={styles.subText}>AI 웰니스 신체 스펙 맞춤 관리</Text>
          </View>
        </View>
      </View>

      {/* 2. 드롭다운 모달 */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleChangeNickname}
              >
                <Edit2 size={16} color="#4B5563" style={styles.menuIcon} />
                <Text style={styles.menuText}>닉네임 변경</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <LogOut size={16} color="#EF4444" style={styles.menuIcon} />
                <Text style={[styles.menuText, styles.logoutText]}>
                  로그아웃
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 🌟 3. 카드 + 인디케이터 + 버튼을 하나의 쫀쫀한 그룹으로 묶는 컨테이너 컨셉 */}
      <View style={styles.contentCenterWrapper}>
        {/* FlatList가 무한정 세로로 늘어나며 아래 버튼을 밀어내지 못하게 고정 높이 부여 */}
        <View style={{ height: CARD_HEIGHT }}>
          <FlatList
            ref={flatListRef}
            data={stepsData}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            initialScrollIndex={0}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </View>

        {/* 🌟 카드 바로 밑에 16px의 균일한 거리로 달라붙는 점 인디케이터 */}
        <View style={styles.dotContainer}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentStep === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* 🌟 인디케이터 밑에 24px의 적당한 거리를 두고 배치되는 일체형 변경하기 버튼 */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            updateProfileMutation.isPending && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveChanges}
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Save size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.saveButtonText}>변경하기</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    // backgroundColor: "#F9FAFB", // 배경색을 미세하게 주어 카드 하이라이트 효과 극대화
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 12 : 24,
  },

  // 🌟 [신규] 카드와 조작 컴포넌트들을 화면 세로 기준 정중앙으로 밀집시키는 핵심 껍데기
  contentCenterWrapper: {
    flex: 1,
    justifyContent: "center", // 🎯 자식 요소들을 상하 정중앙에 모아줌으로써 붕 뜨는 현상 전면 차단!
    alignItems: "center",
    width: "100%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20, // 하단 탭바 레이어 안전 회피 가드 마감
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: CARD_WIDTH,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  profileInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E6ECE8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextSide: {
    justifyContent: "center",
    flex: 1,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  subText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
  },

  // 🚀 [수정] 대하소설 같던 가로 폭을 카드의 크기와 싱크로율 100%로 일치시켜 일체감 부여
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    width: CARD_WIDTH, // 🎯 카드가 가로 폭 90%이므로 버튼도 동일하게 맞춰 고급스러운 테일러드 룩 연출!
    height: 52, // 터치하기 딱 좋은 피트니스 규격 높이
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: "#A7F3D0",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  dropdownMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 120 : 100,
    left: width * 0.05,
    backgroundColor: "#FFFFFF",
    width: 160,
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 8,
  },
  logoutText: {
    color: "#EF4444",
  },
  cardPage: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
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
  cardInner: {
    width: "100%",
    flex: 1,
    justifyContent: "space-between",
  },
  cardContentGap: {
    flex: 1,
    justifyContent: "center",
    gap: 22,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 1,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  inputWrapper: {
    flex: 1,
  },
  fieldBlock: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    paddingLeft: 2,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  textArea: {
    height: 48,
    textAlignVertical: "top",
  },
  gridGroup: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "center",
    marginTop: 12,
    gap: Platform.select({
      ios: 12,
      android: 11,
    }),
  },
  gridChip: {
    width: "48%",
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  chipGroupFull: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
  },
  chipButtonFull: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  chipGroup: {
    flexDirection: "row",
    gap: 6,
  },
  chipButton: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeChip: {
    backgroundColor: "#E6ECE8",
    borderColor: "#34D399",
  },
  activeGridChip: {
    backgroundColor: "#34D399",
    borderColor: "#34D399",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
  },
  activeChipText: {
    color: "#064E3B",
    fontWeight: "bold",
  },

  // 🚀 [수정] 카드 바로 밑에 이쁘게 안착하도록 마진 싹 다이어트!
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 16, // 🎯 카드 하단 경계면으로부터 딱 16px 떨어트리기
    marginBottom: 24, // 🎯 아래 변경하기 버튼과 딱 24px 스페이싱 유지
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 11,
    backgroundColor: "#34D399",
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "#D1D5DB",
  },
});
