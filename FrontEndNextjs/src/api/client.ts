import axios from "axios";
import Cookies from "js-cookie";

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


client.interceptors.request.use(
  (config) => {
    const token = Cookies.get("userToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

