import axios from "../utils/axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getCards = async () => {
  try {
    const response = await axios.get(`${BASE_URL}business-cards`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
};

export const getUserCards = async () => {
  try {
    const response = await axios.get(`${BASE_URL}business-cards/user`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user cards:", error);
    throw error;
  }
};

export const createCard = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}business-cards/create`, data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating card:", error);
    throw error;
  }
};

export const getCard = async (urlCode) => {
  try {
    const response = await axios.get(`${BASE_URL}business-cards/${urlCode}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching card:", error);
    throw error;
  }
};

export const updateCard = async (urlCode, data) => {
  try {
    const response = await axios.put(
      `${BASE_URL}business-cards/${urlCode}`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating card:", error);
    throw error;
  }
};

export const activateCard = async (urlCode) => {
  try {
    const response = await axios.put(
      `${BASE_URL}business-cards/${urlCode}/activate`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error activating card:", error);
    throw error;
  }
};

export const deactivateCard = async (urlCode) => {
  try {
    const response = await axios.put(
      `${BASE_URL}business-cards/${urlCode}/deactivate`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error deactivating card:", error);
    throw error;
  }
};

export const reAssignCard = async (urlCode, newUserId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}business-cards/${urlCode}/reassign`,
      { newUserId }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error reassigning card:", error);
    throw error;
  }
};

export const setCustomUrlCode = async (urlCode, customUrlCode) => {
  try {
    const response = await axios.put(
      `${BASE_URL}business-cards/${urlCode}/custom-url`,
      { customUrlCode }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error setting custom URL:", error);
    throw error;
  }
};

export const getNonAdminUsers = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}business-cards/non-admin-users`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching non-admin users:", error);
    throw error;
  }
};
