import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";
import { Platform } from "react-native";

// Priority order for base URL (local-only):
// 1. EXPO_PUBLIC_API_URL (explicit override)
// 2. If running on Android emulator: use 10.0.2.2 (AVD) or 10.0.3.2 (Genymotion)
// 3. If running on iOS Simulator: localhost is fine
// 4. Fallback to localhost (no deployed links)
const EXPLICIT = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK = "http://localhost:5001";

const ensureApiPrefix = (url) => {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const getDefaultApiBase = () => {
  if (EXPLICIT) return ensureApiPrefix(EXPLICIT);

  // Android (emulator/device)
  if (Platform.OS === "android") {
    // Common emulator host mappings. If you're on a physical Android device, set EXPO_PUBLIC_API_URL to your PC's LAN IP.
    return ensureApiPrefix("http://10.0.2.2:5001");
  }

  // iOS simulator and others can usually use localhost
  if (Platform.OS === "ios") {
    return ensureApiPrefix("http://localhost:5001");
  }

  return ensureApiPrefix(FALLBACK);
};

const API_BASE_URL = getDefaultApiBase();

// this will basically create an authenticated api, pass the token into our headers
export const createApiClient = (getToken) => {
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

export const useApiClient = () => {
  const { getToken } = useAuth();
  return createApiClient(getToken);
};

// ----------- API Objects -----------

export const userApi = {
  syncUser: (api) => api.post("/users/sync"),
  getCurrentUser: (api) => api.get("/users/me"),
  updateProfile: (api, data) => api.put("/users/profile", data),
};

export const postApi = {
  createPost: (api, data) => api.post("/posts", data),
  getPosts: (api) => api.get("/posts"),
  getUserPosts: (api, username) => api.get(`/posts/user/${username}`),
  likePost: (api, postId) => api.post(`/posts/${postId}/like`),
  deletePost: (api, postId) => api.delete(`/posts/${postId}`),
};

export const commentApi = {
  createComment: (api, postId, content) =>
    api.post(`/comments/post/${postId}`, { content }),
};
