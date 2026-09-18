import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useAuth } from "@/utils/AuthContext";
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

export default function Login() {
  const router = useRouter();
  const { checkAuthStatus } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  /////////////////////////////////////////////////////////

  const { mutate: loginMutation, isPending: loginPending } = useLoginMutation();

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert("입력 오류", "이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      Alert.alert("입력 오류", "비밀번호를 입력해주세요.");
      return;
    }
    loginMutation({ email, password });
  };

  /////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={"padding"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={-10}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, width: "100%" }}>
              <View style={styles.headerArea}>
                <Text style={styles.brandSubtitle}>
                  오늘의 건강한 한끼 식단
                </Text>
                <Text style={styles.brandTitle}>ZelonMeal 🥑</Text>
              </View>

              <View style={styles.inputForm}>
                <TextInput
                  style={styles.input}
                  placeholder="이메일을 입력해주세요"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loginPending}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  editable={!loginPending}
                />

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loginPending && styles.disabledButton,
                  ]}
                  onPress={handleLogin}
                  disabled={loginPending}
                >
                  {loginPending ? (
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
                  disabled={loginPending}
                >
                  <Text style={styles.signupLinkText}>회원가입</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/////////////////////////////////////////////////////////

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
    height: 56,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#A7F3D0",
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
    flexGrow: 1,
    paddingVertical: 80,
    justifyContent: "center",
  },
});
