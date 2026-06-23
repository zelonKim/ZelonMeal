import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// 🚀 백엔드 전송을 위한 Mutation 훅 임포트
import { client } from "@/api/client";
import { useMutation } from "@tanstack/react-query";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const validateForm = () => {
    // 1. 이메일 형식 정규식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("입력 오류", "올바른 이메일 형식이 아닙니다.");
      return false;
    }

    // 2. 비밀번호 영문 + 숫자 조합 및 8자리 이상 검사
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "입력 오류",
        "비밀번호는 영문과 숫자를 조합하여 8자리 이상 입력해주세요.",
      );
      return false;
    }

    // 3. 비밀번호 일치 확인 검사
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
      <View style={styles.headerArea}>
        <Text style={styles.title}>식사하셨나요? 📋</Text>
        <Text style={styles.subtitle}>
          AI로부터 건강한 식단을 추천받아보세요!
        </Text>
      </View>

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

      <View style={styles.footerArea}>
        <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          disabled={signupMutation.isPending}
        >
          <Text style={styles.backLinkText}>로그인</Text>
        </TouchableOpacity>
      </View>
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
    marginVertical: 55,
    paddingBottom: 150,
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
  signupButton: {
    backgroundColor: "#10B981",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    height: 56, // 인디케이터 회전 시 레이아웃 무너짐 방지용 고정 높이
  },
  disabledButton: {
    backgroundColor: "#A7F3D0", // 로딩 중일 때 연한 초록색으로 비활성화 표시
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
    marginBottom: 90,
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
  keyboardAvoidingWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
