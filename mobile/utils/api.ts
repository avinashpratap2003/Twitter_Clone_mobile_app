import axios, { AxiosInstance } from "axios";
import { useAuth } from "@clerk/clerk-expo";
import { Platform } from "react-native";

// Priority order for base URL (local-only):
// 1. EXPO_PUBLIC_API_URL (explicit override)
// 2. If running on Android emulator: use 10.0.2.2 (AVD) or 10.0.3.2 (Genymotion)
// 3. If running on iOS Simulator: localhost is fine
// 4. Fallback to localhost (no deployed links)
const EXPLICIT = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK = "http://localhost:5001";

const getDefaultApiBase = () => {
  if (EXPLICIT) return EXPLICIT;

  // Android (emulator/device)
  if (Platform.OS === "android") {
    // Common emulator host mappings. If you're on a physical Android device, set EXPO_PUBLIC_API_URL to your PC's LAN IP.
    // Try Android Studio emulator first (10.0.2.2), then Genymotion (10.0.3.2), otherwise fallback to deployed
    return "http://10.0.2.2:5001";
  }

  // iOS simulator and others can usually use localhost
  if (Platform.OS === "ios") {
    return "http://localhost:5001";
  }

  return FALLBACK;
};

const API_BASE_URL = getDefaultApiBase();
// ! 🔥 localhost api would not work on your actual physical device
// const API_BASE_URL = "http://localhost:5001/api";

// this will basically create an authenticated api, pass the token into our headers
export const createApiClient = (getToken: () => Promise<string | null>): AxiosInstance => {
  console.log("[api] using baseURL:", API_BASE_URL);
  const api = axios.create({ baseURL: API_BASE_URL });

  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();
  return createApiClient(getToken);
};

export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: any) => api.put("/users/profile", data),
};

export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
    api.post("/posts", data),
  getPosts: (api: AxiosInstance) => api.get("/posts"),
  getUserPosts: (api: AxiosInstance, username: string) => api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
};

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
};
