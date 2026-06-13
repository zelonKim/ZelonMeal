import axios from "axios";
// import SecureLS from "secure-ls";

// const ls =
//   typeof window !== "undefined" ? new SecureLS({ encodingType: "aes" }) : null;

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// client.interceptors.request.use(
//   (config) => {
//     const token = ls ? ls.get("userToken") : null;

//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// client.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       if (typeof window !== "undefined") {
//         alert("토큰이 만료되었습니다.");
//         if (ls) ls.remove("userToken");
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   },
// );
