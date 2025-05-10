/**
 * Configuration file for the application
 * Contains all URLs and authentication helper functions
 */

// Base URLs
export const BASE_URL = "http://localhost:3002/api";
export const API_URL = BASE_URL;
export const IMAGE_URL = "http://localhost:3002";

/**
 * Get authentication headers with JWT token
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/**
 * Refresh the authentication token
 * @returns {Promise<string|null>} New token or null if refresh failed
 */
export const refreshToken = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    const newToken = data.token;

    if (newToken) {
      localStorage.setItem("token", newToken);
      return newToken;
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a token
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Clear authentication data (logout)
 */
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userType");
  localStorage.removeItem("isAdmin");
};
