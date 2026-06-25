import { client } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("입력 오류", "올바른 이메일 형식이 아닙니다.");
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "입력 오류",
        "비밀번호는 영문과 숫자를 조합하여 8자리 이상 입력해주세요.",
      );
      return false;
    }

    if (password !== passwordConfirm) {
      Alert.alert("입력 오류", "비밀번호가 일치하지 않습니다.");
      return false;
    }

    return true;
  };

  const signupMutation = useMutation({
    mutationFn: async () => {
      const response = await client.post("/v1/users/signup/", {
        email: email.trim(),
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      Alert.alert(
        "환영합니다 🤗",
        data.message || "회원가입이 완료되었습니다.",
        [
          {
            text: "확인",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    },
    onError: (error: any) => {
      const serverError = error.response?.data;
      let errorMessage = "서버와 통신 중 오류가 발생했습니다.";

      if (serverError) {
        if (serverError.email) {
          errorMessage = Array.isArray(serverError.email)
            ? serverError.email[0]
            : serverError.email;
        } else if (serverError.password) {
          errorMessage = Array.isArray(serverError.password)
            ? serverError.password[0]
            : serverError.password;
        } else if (serverError.message) {
          errorMessage = serverError.message;
        }
      }

      Alert.alert("회원가입 실패", errorMessage);
    },
  });

  const handleSignUp = () => {
    if (validateForm()) {
      signupMutation.mutate();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. 화면 전체를 감싸는 키보드 회피 뷰 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        {/* 2. 유연한 스크롤을 위한 스크롤 뷰 */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* 3. 빈 화면 터치 시 키보드 닫기 래퍼 */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, width: "100%" }}>
              {/* 좌측 상단 뒤로가기 바 */}
              {/* <View style={styles.topNavigation}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  disabled={signupMutation.isPending}
                >
                  <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
              </View> */}

              {/* 헤더 타이틀 영역 */}
              <View style={styles.headerArea}>
                <Text style={styles.title}>식사하셨나요? 📋</Text>
                <Text style={styles.subtitle}>
                  AI로부터 건강한 식단을 추천받아보세요!
                </Text>
              </View>

              {/* 입력 폼 영역 */}
              <View style={styles.inputForm}>
                <TextInput
                  style={styles.input}
                  placeholder="이메일"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!signupMutation.isPending}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 (영문/숫자 조합 8자 이상)"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  editable={!signupMutation.isPending}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 확인"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  editable={!signupMutation.isPending}
                />

                <TouchableOpacity
                  style={[
                    styles.signupButton,
                    signupMutation.isPending && styles.disabledButton,
                  ]}
                  onPress={handleSignUp}
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.signupButtonText}>시작하기</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* 하단 푸터 영역 */}
              <View style={styles.footerArea}>
                <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login")}
                  disabled={signupMutation.isPending}
                >
                  <Text style={styles.backLinkText}>로그인</Text>
                </TouchableOpacity>
              </View>
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
  },
  // 🍏 새로 추가된 스크롤 컨테이너 (기존 container 스타일 이식)
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  topNavigation: {
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  headerArea: {
    marginTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  inputForm: {
    width: "100%",
    gap: 12,
    marginVertical: 40,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: "#111827",
  },
  signupButton: {
    backgroundColor: "#10B981",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    height: 56,
  },
  disabledButton: {
    backgroundColor: "#A7F3D0",
  },
  signupButtonText: {
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
    marginBottom: 60,
  },
  footerText: {
    fontSize: 14,
    color: "#4B5563",
  },
  backLinkText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "800",
  },
});
