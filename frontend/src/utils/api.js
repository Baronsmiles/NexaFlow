import axios from 'axios';

import {
  getAccessToken,
  saveAuth,
  getUser,
  clearAuth
} from './auth';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true
});


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



api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';

    // Authentication endpoints that should NOT
    // trigger the refresh-token process.
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/google') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/otp') ||
      requestUrl.includes('/auth/reset-password') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    // Only try to refresh when:
    // 1. Server returned 401
    // 2. This request hasn't already been retried
    // 3. It isn't an authentication request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true
          }
        );

        const newAccessToken =
          response.data.accessToken;

        // Save the new access token.
        // Keep the existing user.
        saveAuth(
          newAccessToken,
          getUser()
        );

        // Attach the new access token
        // to the original failed request.
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Retry the original request.
        return api(originalRequest);

      } catch (refreshError) {
        console.error(
          'Session refresh failed:',
          refreshError
        );

        // Refresh token is invalid,
        // expired or revoked.
        clearAuth();

        window.location.href = '/auth/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;