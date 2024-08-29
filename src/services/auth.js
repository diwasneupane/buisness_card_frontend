import axios from "../utils/axios";
import Cookies from "js-cookie";

const ACCESS_TOKEN_COOKIE_NAME = "access_token";
const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

const BASE_URL = "/users";

export const setAuthTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    Cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  } else {
    Cookies.remove(ACCESS_TOKEN_COOKIE_NAME);
    delete axios.defaults.headers.common["Authorization"];
  }

  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken);
  } else {
    Cookies.remove(REFRESH_TOKEN_COOKIE_NAME);
  }
};

export const getAuthToken = () => {
  return Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
};

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, { email, password });
    const { user, access_token, refresh_token } = response.data.data;
    setAuthTokens(access_token, refresh_token);
    return { user, token: access_token };
  } catch (error) {
    console.error("Login error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      username,
      email,
      password,
    });
    const { user, access_token, refresh_token } = response.data.data;
    setAuthTokens(access_token, refresh_token);
    return { user, token: access_token };
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const logoutUser = async () => {
  try {
    await axios.post(`${BASE_URL}/logout`);
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    setAuthTokens(null, null);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/current-user`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    if (error.response && error.response.status === 401) {
      setAuthTokens(null, null);
    }
    throw error.response ? error.response.data : error.message;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await axios.post(`${BASE_URL}/refresh-token`, {
      refreshToken,
    });
    const { access_token } = response.data.data;
    setAuthTokens(access_token, refreshToken);
    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    setAuthTokens(null, null);
    throw error;
  }
};
