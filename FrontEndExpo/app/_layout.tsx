import { APIProvider } from "@/api/api-provider";
import { SplashScreen, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const AuthContext = createContext<{
  isLoggedIn: boolean;
  checkAuthStatus: () => Promise<void>;
}>({ isLoggedIn: false, checkAuthStatus: async () => {} });

export const useAuth = () => useContext(AuthContext);

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <APIProvider>{children}</APIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      setIsLoggedIn(!!token);
    } catch (e) {
      console.warn("인증 토큰 조회 실패:", e);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await checkAuthStatus();
      setIsReady(true);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (isReady && isLoggedIn !== null) {
      SplashScreen.hideAsync();
    }
  }, [isReady, isLoggedIn]);

  if (!isReady || isLoggedIn === null) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, checkAuthStatus }}>
      <Providers>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isLoggedIn === false}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>

          <Stack.Protected guard={isLoggedIn === true}>
            <Stack.Screen
              name="(screen)"
              options={{ animation: "fade_from_bottom" }}
            />
          </Stack.Protected>
        </Stack>
      </Providers>
    </AuthContext.Provider>
  );
}
