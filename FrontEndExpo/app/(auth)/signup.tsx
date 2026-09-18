import { useSignupMutation } from "@/hooks/useSignupMutation";
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

  const { mutate: signupMutation, isPending: signupPending } =
    useSignupMutation();

  const handleSignUp = () => {
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

    signupMutation({ email, password });
  };

  ///////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, width: "100%" }}>
              <View style={styles.headerArea}>
                <Text style={styles.title}>식사하셨어요? 🥗</Text>
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
                  editable={!signupPending}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 (영문/숫자 조합 8자 이상)"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  editable={!signupPending}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 확인"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  editable={!signupPending}
                />

                <TouchableOpacity
                  style={[
                    styles.signupButton,
                    signupPending && styles.disabledButton,
                  ]}
                  onPress={handleSignUp}
                  disabled={signupPending}
                >
                  {signupPending ? (
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
                  disabled={signupPending}
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

///////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

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
