import { client } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../_layout";

export default function Login() {
  const router = useRouter();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const ClearTokens = async () => {
      try {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await checkAuthStatus();
      } catch (err) {
        console.log("에러 발생:", err);
      }
    };
    ClearTokens();
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("입력 오류", "이메일을 입력해주세요.");
      return false;
    }
    if (!password) {
      Alert.alert("입력 오류", "비밀번호를 입력해주세요.");
      return false;
    }
    return true;
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await client.post("/v1/users/login/", {
        email: email.trim(),
        password,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        await SecureStore.setItemAsync("userToken", data.access);
        await SecureStore.setItemAsync("refreshToken", data.refresh);

        await checkAuthStatus();

        router.replace("/(screen)");
      } catch (e) {
        Alert.alert("로그인 오류", "인증 정보를 저장하는 중 실패했습니다.");
      }
    },
    onError: (error: any) => {
      const serverError = error.response?.data;
      let errorMessage = "이메일 또는 비밀번호를 다시 확인해주세요.";

      // 장고 Simple JWT가 던지는 구체적인 에러 메시지가 있을 경우 매핑
      if (serverError && serverError.detail) {
        errorMessage = serverError.detail; // 예: "No active account found with the given credentials"
        if (errorMessage.includes("No active account")) {
          errorMessage = "이메일 혹은 비밀번호가 틀렸습니다.";
        }
      }

      Alert.alert("로그인 실패", errorMessage);
    },
  });

  const handleLogin = () => {
    if (validateForm()) {
      loginMutation.mutate();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. 화면 전체를 유연하게 늘려줄 KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={"padding"}
        style={{ flex: 1 }}
        // 일반 화면에서는 헤더 높이 등을 감안해 보통 0 ~ 40 사이의 양수 값을 줍니다.
        keyboardVerticalOffset={-10}
      >
        {/* 2. 인풋을 누르면 키보드 위로 자연스럽게 스크롤 되도록 설정 */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* 3. 인풋창 외의 빈 화면을 누르면 키보드가 스르륵 닫히는 UX 제공 */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, width: "100%" }}>
              {/* [기존 코드] 헤더 영역 */}
              <View style={styles.headerArea}>
                <Text style={styles.brandSubtitle}>
                  오늘의 건강한 한끼 식단
                </Text>
                <Text style={styles.brandTitle}>ZelonMeal 🥑</Text>
              </View>

              {/* [기존 코드] 인풋 폼 영역 */}
              <View style={styles.inputForm}>
                <TextInput
                  style={styles.input}
                  placeholder="이메일을 입력해주세요"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loginMutation.isPending}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  editable={!loginMutation.isPending}
                />

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loginMutation.isPending && styles.disabledButton,
                  ]}
                  onPress={handleLogin}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>로그인</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.footerArea}>
                <Text style={styles.footerText}>계정이 없으신가요?</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/signup")}
                  disabled={loginMutation.isPending}
                >
                  <Text style={styles.signupLinkText}>회원가입</Text>
                </TouchableOpacity>
              </View>
              {/* [기존 코드] 푸터 영역 */}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerArea: {
    marginBottom: 60,
    marginTop: 20,
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 31,
    fontWeight: "bold",
    color: "#10B981",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 48,
    fontWeight: "500",
  },
  inputForm: {
    width: "100%",
    gap: 12,
    marginBottom: 50,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
  },
  loginButton: {
    backgroundColor: "#34D399",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    height: 56, // 고정 높이 지정으로 ActivityIndicator 로딩 시 찌그러짐 방지
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#A7F3D0", // 로딩 중 버튼 비활성화 색상
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerArea: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: Platform.OS === "ios" ? 190 : 150,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  signupLinkText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "bold",
  },
  scrollContainer: {
    flexGrow: 1, // 스크롤 뷰 내부 내용이 화면 전체로 늘어나도록 설정
    paddingVertical: 80, // 기존 container에 있던 패딩을 일로 이동!
    justifyContent: "center", // 키보드가 없을 때 전체 내용을 화면 정중앙에 배치!
  },
});
