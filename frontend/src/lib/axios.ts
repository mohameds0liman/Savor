// // shared axios instance for all requests carrying auth token
// // Use apiClient in protected pages instead of raw axios
// // but for public pages use axios directly
// import axios from "axios";
// import { API_URL } from "./api";

// const apiClient = axios.create({
//   baseURL: `${API_URL}/api`,
// });

// // attach token on every request if present
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default apiClient;


import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "./api";

// Augment the config type with a custom retry flag.
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
});

let refreshPromise: Promise<string | null> | null = null;

// Queue of requests that failed with 401 while a refresh is in flight.
let pendingQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: RetriableConfig;
}[] = [];

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_URL}/api/refresh`, { refreshToken });
    const newAccessToken = data.data.accessToken;
    localStorage.setItem("token", newAccessToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

function handleRefreshSuccess(newToken: string | null) {
  pendingQueue.forEach(({ resolve, config }) => {
    if (newToken) config.headers.Authorization = `Bearer ${newToken}`;
    resolve(apiClient(config));
  });
  pendingQueue = [];
}

function handleRefreshFailure() {
  pendingQueue.forEach(({ reject }) => reject(new AxiosError("Session expired")));
  pendingQueue = [];
  cleanupAuth();
}

function cleanupAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userName");
  if (typeof window !== "undefined") window.location.href = "/login";
}

// Attach token on every request if present.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig;

    // Not a 401, no config, or already retried -> pass it through.
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // The refresh call itself failed -> session is dead.
    if (original.url?.includes("/refresh")) {
      cleanupAuth();
      return Promise.reject(error);
    }

    // Start (or reuse) a single refresh.
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    // Queue this request until the refresh resolves.
    return new Promise((resolve, reject) => {
      pendingQueue.push({
        resolve,
        reject,
        config: { ...original, _retry: true } as RetriableConfig,
      });

      refreshPromise!.then((newToken) => {
        handleRefreshSuccess(newToken);
      }).catch(() => {
        handleRefreshFailure();
      });
    });
  }
);

export default apiClient;