import axios from 'axios';
import { getAccessToken, saveAuth, getUser, clearAuth } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:5050/api',
  withCredentials: true
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Refresh expired access token
api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // Only refresh when access token has expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          'http://localhost:5050/api/auth/refresh',
          {},
          {
            withCredentials: true
          }
        );

        const newAccessToken = response.data.accessToken;

        // Save the new access token
        saveAuth(newAccessToken, getUser());

        // Put the new token on the failed request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Try the original request again
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);

        // Refresh token is also invalid/expired
        clearAuth();

        window.location.href = '/auth/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;