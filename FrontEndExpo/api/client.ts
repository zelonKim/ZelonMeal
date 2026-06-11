import axios from "axios";

export const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// client.interceptors.request.use(
//   async (config) => {
//     try {
//       const token = await SecureStore.getItemAsync("userToken");

//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       } else {
//         delete config.headers.Authorization;
//       }
//     } catch (error) {
//       console.error("인터셉터 토큰 로드 에러:", error);
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );
