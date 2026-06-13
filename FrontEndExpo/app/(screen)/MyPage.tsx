import { client } from "@/api/client";
import { useAuth } from "@/app/_layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Pressable,
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

  // 닉네임 수정 팝업 제어용 레이어 상태
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

  // ------------------------------------------
  // 1️⃣ [GET] 로그인한 유저 프로필 조회 API 연동
  // ------------------------------------------
  const { data, isLoading } = useQuery({
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

  // 가입일 기반 오늘이 몇 일차인지 디데이 계산기 파이프라인
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

  // ------------------------------------------
  // 2️⃣ [PATCH] 유저 신체 스펙 정보 수정 API 연동
  // ------------------------------------------
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
      Alert.alert("저장 완료", "유저 정보가 성공적으로 변경되었습니다!");
    },
    onError: () => {
      Alert.alert(
        "저장 실패",
        "프로필 정보를 수정하는 중 오류가 발생했습니다.",
      );
    },
  });

  // ------------------------------------------
  // 3️⃣ [PATCH] 유저 닉네임(username) 단독 수정 API 연동
  // ------------------------------------------
  const updateNicknameMutation = useMutation({
    mutationFn: async (newNickname: string) => {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await client.patch(
        "/v1/users/profile/",
        { username: newNickname },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setNicknameModalVisible(false);
      Alert.alert("변경 완료", "닉네임이 성공적으로 변경되었습니다!");
    },
    onError: (error: any) => {
      const serverError =
        error.response?.data?.username?.[0] ||
        "닉네임 변경 중 오류가 발생했습니다.";
      Alert.alert("변경 실패", serverError);
    },
  });

  const handleSaveChanges = () => {
    updateProfileMutation.mutate(userInfo);
  };

  const handleChangeNickname = () => {
    setMenuVisible(false);
    setNewUsername(userInfo.username);
    setNicknameModalVisible(true);
  };

  const handleConfirmNickname = () => {
    if (!newUsername.trim()) {
      Alert.alert("입력 오류", "닉네임을 한 글자 이상 입력해 주세요.");
      return;
    }
    updateNicknameMutation.mutate(newUsername.trim());
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

  const stepsData = [0, 1, 2, 3];

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
      {/* 🚀 전용 민트 배너 내부 우측 상단에 정교하게 배치된 프리미엄 디데이 뱃지 레이아웃 */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfoLeft}>
          {/* 아바타 영역 (텍스트 공백 싹 제거하여 크래시 완전 방멸) */}
          <TouchableOpacity
            style={styles.avatarBorderRing}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <UserIcon size={24} color="#059669" />
            </View>
          </TouchableOpacity>

          <Pressable onPress={() => setMenuVisible(true)}>
            {/* 텍스트 영역: 서브 정보 가독성 보강 */}
            <View style={styles.headerTextSide}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.usernameText} numberOfLines={1}>
                  {userInfo.username || "이름 없음"}
                </Text>
                <Text style={styles.nimText}>님</Text>
              </View>
              <View style={styles.infoRowUnder}>
                <Text style={styles.subText}>
                  {userInfo.email || "이메일 정보 없음"}
                </Text>
              </View>
            </View>
          </Pressable>
          {/* 🎯 [신규 이식] 프로필 헤더 카드 우측 상단에 절묘하게 흐르는 스페셜 그린 뱃지 */}
          <View style={styles.badgeAbsolutePosition}>
            <Text style={styles.badgeTextLayout}>
              {getMealDayCount(userInfo.created_at)}
            </Text>
          </View>
        </View>
      </View>

      {/* 아바타 드롭다운 모달 */}
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

      {/* 닉네임 입력 전용 프레임 모달 */}
      <Modal
        visible={nicknameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNicknameModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.nicknameModalBox}>
            <Text style={styles.nicknameModalTitle}>✏️ 닉네임 변경</Text>
            <Text style={styles.nicknameModalSub}>
              ZelonMeal에서 사용할 새로운 닉네임을 적어주세요.
            </Text>

            <TextInput
              style={styles.nicknameInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="변경할 닉네임 입력"
              maxLength={15}
              autoFocus={true}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />

            <View style={styles.nicknameButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setNicknameModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  styles.modalConfirmBtn,
                  updateNicknameMutation.isPending &&
                    styles.modalConfirmBtnDisabled,
                ]}
                onPress={handleConfirmNickname}
                disabled={updateNicknameMutation.isPending}
              >
                {updateNicknameMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>변경 완료</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 카드 슬라이드 본체 패널 가드 */}
      <View style={styles.contentCenterWrapper}>
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
    alignItems: "center",
    paddingTop: 28,
  },
  contentCenterWrapper: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
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
    position: "relative", // 👈 내부 자식 요소의 절대 좌표 배치를 잡기 위한 기준점 마련
    flexDirection: "row",
    alignItems: "center",
    width: CARD_WIDTH,
    marginTop: 20,
    marginBottom: 69,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#E6F4EE",
    borderRadius: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  profileInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarBorderRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0FAF5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextSide: {
    justifyContent: "center",
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  usernameText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#047857",
    letterSpacing: -0.6,
  },
  nimText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#047857",
    marginLeft: 3,
  },
  infoRowUnder: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  subText: {
    fontSize: 13,
    color: "#047857", // 가독성을 보완하기 위한 조명 최적화 소프트 에메랄드 그린
    fontWeight: "500",
  },

  // 🌟 [신규 스타일] 프로필 배너 우측 상단에 딱 붙을 럭셔리 네이티브 뱃지 좌표계
  badgeAbsolutePosition: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#4FA082", // 활력 가득한 비비드 그린 솔리드 매칭
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeTextLayout: {
    fontSize: 11,
    fontWeight: "900", // 숫자가 직관적으로 튀어나오도록 최고 볼드 적용
    color: "#FFFFFF", // 흰색 폰트로 가독성 백퍼센트 확보
  },

  saveButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    width: CARD_WIDTH,
    height: 52,
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
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  nicknameModalBox: {
    backgroundColor: "#FFFFFF",
    width: width * 0.84,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  nicknameModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  nicknameModalSub: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 20,
  },
  nicknameInput: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    marginBottom: 20,
  },
  nicknameButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtn: {
    backgroundColor: "#F3F4F6",
  },
  modalCancelBtnText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
  },
  modalConfirmBtn: {
    backgroundColor: "#10B981",
  },
  modalConfirmBtnDisabled: {
    backgroundColor: "#A7F3D0",
  },
  modalConfirmBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  dropdownMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 165 : 155,
    left: width * 0.15,
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
    paddingVertical: 21,
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
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
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
