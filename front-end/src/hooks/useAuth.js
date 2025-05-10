import { useState, useContext } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import { ShopContext } from "../compontes/context/ShopContext";
import axiosInstance from "./axiosInstance";

// Zod schema for registration validation
const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Name is required")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Zod schema for login validation
const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

/**
 * Custom hook for authentication
 * @returns {Object} Authentication methods and state
 */
export const useAuth = () => {
  const {
    setToken,
    setUsername,
    setUserEmail,
    setUserRole,
    setUserPermissions,
    setIsAdmin
  } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Calculate password strength
   * @param {string} password - The password to check
   * @returns {string} "Weak", "Medium", or "Strong"
   */
  const getPasswordStrength = (password) => {
    if (!password || password.length < 8) return "Weak";

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

    if (strength <= 2) return "Weak";
    if (strength === 3) return "Medium";
    return "Strong";
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Result of registration attempt
   */
  const register = async (userData) => {
    setLoading(true);
    setErrors({});

    try {
      // Validate input data
      const validationResult = registerSchema.safeParse(userData);

      if (!validationResult.success) {
        const formattedErrors = {};
        validationResult.error.errors.forEach(error => {
          formattedErrors[error.path[0]] = error.message;
        });
        setErrors(formattedErrors);
        setLoading(false);
        return { success: false, errors: formattedErrors };
      }

      // Submit registration request
      try {
        const response = await axiosInstance.post("/auth/register", {
          username: userData.username,
          email: userData.email,
          password: userData.password,
        });

        if (response && (response.status === 201 || response.status === 200)) {
          setUserRole(null);
          setUserPermissions(null);
          setIsAdmin(false);

          localStorage.setItem("userRole", "");
          localStorage.setItem("userType", "customer");
          localStorage.setItem("isAdmin", "false");

          toast.success("Account registered successfully");
          setLoading(false);
          return { success: true };
        } else {
          const message = response?.data?.message || "Registration failed";
          toast.error(message);
          setErrors({ server: message });
          setLoading(false);
          return { success: false, message };
        }
      } catch (requestError) {
        console.error("Registration request error:", requestError);

        const errorMessage = requestError?.response?.data?.message ||
                            "Registration failed. Please try again.";

        toast.error(errorMessage);
        setErrors({ server: errorMessage });
        setLoading(false);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error("Registration outer error:", error);
      toast.error("An unexpected error occurred during registration.");
      setLoading(false);
      return { success: false, errors: { server: "An unexpected error occurred" } };
    }
  };

  /**
   * Log in a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} Result of login attempt
   */
  const login = async (credentials) => {
    setLoading(true);
    setErrors({});

    try {
      // Validate input data
      const validationResult = loginSchema.safeParse(credentials);

      if (!validationResult.success) {
        const formattedErrors = {};
        validationResult.error.errors.forEach(error => {
          formattedErrors[error.path[0]] = error.message;
        });
        setErrors(formattedErrors);
        setLoading(false);
        return { success: false, errors: formattedErrors };
      }

      // Submit login request
      try {
        const response = await axiosInstance.post("/auth/login", {
          email: credentials.email,
          password: credentials.password,
        });

        if (response && (response.status === 201 || response.status === 200)) {
          const { token, user } = response.data;

          const name = user?.name || response.data.name;
          const email = user?.email || response.data.email;
          const role = user?.role || null;
          const permissions = user?.permissions || null;
          const isAdmin = user?.isAdmin || false;

          setToken(token);
          localStorage.setItem("token", token);
          setUsername(name);
          setUserEmail(email);

          setUserRole(role);
          setUserPermissions(permissions);
          setIsAdmin(isAdmin);

          localStorage.setItem("userRole", role ? role.toString() : "");
          localStorage.setItem("userType", isAdmin ? "admin" : "customer");
          localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

          toast.success("Login successful");
          setLoading(false);
          return { success: true };
        } else {
          const message = response?.data?.message || "Login failed";
          toast.error(message);
          setErrors({ server: message });
          setLoading(false);
          return { success: false, message };
        }
      } catch (requestError) {
        console.error("Login request error:", requestError);

        const errorMessage = requestError?.response?.data?.message ||
                            "Login failed. Please try again.";

        toast.error(errorMessage);
        setErrors({ server: errorMessage });
        setLoading(false);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error("Login outer error:", error);
      toast.error("An unexpected error occurred during login.");
      setLoading(false);
      return { success: false, errors: { server: "An unexpected error occurred" } };
    }
  };

  /**
   * Log out the current user
   */
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userType");
    localStorage.removeItem("isAdmin");

    // Clear state
    setToken("");
    setUsername("");
    setUserEmail("");
    setUserRole(null);
    setUserPermissions(null);
    setIsAdmin(false);

    toast.success("Logged out successfully");
  };

  return {
    register,
    login,
    logout,
    loading,
    errors,
    getPasswordStrength,
  };
};

export default useAuth;
