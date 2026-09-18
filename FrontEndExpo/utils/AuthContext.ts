import { createContext, useContext } from "react";

export const AuthContext = createContext<{
  isLoggedIn: boolean;
  checkAuthStatus: () => Promise<void>;
}>({ isLoggedIn: false, checkAuthStatus: async () => {} });

export const useAuth = () => useContext(AuthContext);
