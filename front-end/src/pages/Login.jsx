import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../compontes/context/ShopContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import InputValidation from "../utils/InputValidation";

function Login() {
  const [currentState, setCurrentState] = useState("Login");
  const { token } = useContext(ShopContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [previousPage, setPreviousPage] = useState("/");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const navigate = useNavigate();
  const { register, login, loading, errors, getPasswordStrength } = useAuth();

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(getPasswordStrength(password));
    } else {
      setPasswordStrength("");
    }
  }, [password, getPasswordStrength]);

  // Store the previous page for redirect after login
  useEffect(() => {
    const referrer = document.referrer;
    if (referrer && !referrer.includes("/login") && !referrer.includes("/register")) {
      setPreviousPage(referrer);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate(previousPage || "/");
    }
  }, [token, navigate, previousPage]);

  const onSubmit = async (event) => {
    event.preventDefault();

    // Validate name (letters only) for Sign Up
    if (currentState === "Sign Up") {
      // Check for name validation - should already be validated by InputValidation
      // but double-check in case of direct form submission
      const validatedName = InputValidation(name, "letter");
      if (validatedName !== name || validatedName.length === 0) {
        setNameError("Name can only contain letters and spaces");
        return;
      }

      // Check for email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address");
        return;
      }

      // Check password match
      if (password !== confirmPassword) {
        return;
      }

      const result = await register({
        username: name,
        email,
        password,
        confirmPassword,
      });

      if (result.success) {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setNameError("");
        setEmailError("");
        setCurrentState("Login");
      }
    } else {
      // Validate email for Login
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address");
        return;
      }

      const result = await login({
        email,
        password,
      });

      if (result.success) {
        window.location="/"
        setEmailError("");
      }
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center w-[90%] sm:w-96 m-auto mt-14 mb-12 gap-6 text-gray-800 bg-white shadow-md rounded-lg p-6"
    >
      <div className="flex flex-col items-center gap-2 mb-4">
        <p className="text-3xl font-semibold text-gray-800">{currentState}</p>
        <div className="h-1 w-8 bg-gray-800 rounded-full"></div>
      </div>

      {/* Name field - only shown for Sign Up */}
      {currentState === "Sign Up" && (
        <div className="w-full">
          <div className="relative">
            <input
              onChange={(e) => {
                const value = e.target.value;
                // Apply letter validation
                const validatedValue = InputValidation(value, "letter");
                setName(validatedValue);

                // Clear error if valid
                if (validatedValue && validatedValue.length > 0) {
                  setNameError("");
                }
              }}
              value={name}
              type="text"
              className={`w-full px-4 py-3 border ${nameError ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-gray-800 focus:outline-none`}
              placeholder="Name"
              required
              title="Name can only contain letters and spaces"
            />
          </div>
          {(nameError || errors?.username) && (
            <p className="text-red-500 text-sm mt-1">{nameError || errors?.username}</p>
          )}
        </div>
      )}

      {/* Email field */}
      <div className="w-full">
        <div className="relative">
          <input
            onChange={(e) => {
              const value = e.target.value;
              setEmail(value);
              // Email validation
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (value && !emailRegex.test(value)) {
                setEmailError("Please enter a valid email address");
              } else {
                setEmailError("");
              }
            }}
            value={email}
            type="email"
            className={`w-full px-4 py-3 border ${emailError ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-gray-800 focus:outline-none`}
            placeholder="Email"
            required
          />
        </div>
        {(emailError || errors?.email) && (
          <p className="text-red-500 text-sm mt-1">{emailError || errors?.email}</p>
        )}
      </div>

      {/* Password field with show/hide toggle */}
      <div className="w-full">
        <div className="relative">
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-800 focus:outline-none"
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Password strength indicator */}
        {password.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center">
              <FaLock className="mr-2 text-gray-600" />
              <div className="text-sm">
                Strength:
                <span className={`ml-1 font-medium ${
                  passwordStrength === "Weak" ? "text-red-500" :
                  passwordStrength === "Medium" ? "text-yellow-500" :
                  "text-green-500"
                }`}>
                  {passwordStrength}
                </span>
              </div>
            </div>
          </div>
        )}

        {errors?.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password field - only shown for Sign Up */}
      {currentState === "Sign Up" && (
        <div className="w-full">
          <div className="relative">
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              type={showConfirmPassword ? "text" : "password"}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-800 focus:outline-none"
              placeholder="Confirm Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors?.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      )}



      <div className="w-full flex justify-end text-sm">
        {currentState === "Login" ? (
          <p
            onClick={() => {
              setEmail("");
              setPassword("");
              setCurrentState("Sign Up");
            }}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            Create Account
          </p>
        ) : (
          <p
            onClick={() => {
              setName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setCurrentState("Login");
            }}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            Login Here
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-1/2 px-4 py-3 bg-green-900 text-white font-semibold hover:bg-gray-700 transition-all duration-300 ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Processing..." : currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
}

export default Login;
