import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../compontes/context/ShopContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../hooks/axiosInstance";
import { API_URL } from "../config/index";

function MyProfile() {
  const {
    username,
    userEmail,
    logout,
    setUsername,
    setUserEmail
  } = useContext(ShopContext);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: username || "",
    email: userEmail || "",
    currentPassword: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false
  });

  const navigate = useNavigate();

  // Fetch user profile data when component mounts
  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_URL}/auth/profile`);

      if (response.status === 200) {
        const { user } = response.data;

        // Update context
        setUsername(user.name);
        setUserEmail(user.email);

        // Update form data
        setFormData(prevData => ({
          ...prevData,
          name: user.name,
          email: user.email
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field]
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name (only letters and spaces)
    if (formData.name && !/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Validate password if provided
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required";
      }

      if (formData.newPassword.length < 8) {
        newErrors.newPassword = "New password must be at least 8 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Only send name and password fields
      const dataToSend = {
        name: formData.name
      };

      if (formData.newPassword) {
        dataToSend.currentPassword = formData.currentPassword;
        dataToSend.newPassword = formData.newPassword;
      }

      const response = await axiosInstance.put(`${API_URL}/auth/profile`, dataToSend);

      if (response.status === 200) {
        // Update context with new name
        setUsername(response.data.user.name);

        // Reset password fields
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
        });

        toast.success("Profile updated successfully!");
        setShowEditPopup(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Current password is incorrect");
          setErrors({
            ...errors,
            currentPassword: "Current password is incorrect"
          });
        } else if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to update profile");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mb-4 mx-auto p-8 bg-white shadow-md rounded-lg">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 pb-6 border-b border-gray-300">
        <div className="relative mb-4 md:mb-0">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg"
            alt="Default Profile"
            className="w-24 h-24 rounded-full border border-gray-400 object-cover"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{username || "Loading..."}</h1>
          <p className="text-gray-600">{userEmail || "Loading..."}</p>
          <p className="text-sm text-gray-500 mt-1">Member since {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Account Management Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowEditPopup(true)}
          className="px-5 py-3 text-lg font-medium text-white bg-green-700 rounded-lg shadow hover:bg-green-800 focus:ring focus:ring-green-300 transition-colors"
          disabled={loading}
        >
          Edit Profile
        </button>
        <button
          onClick={handleLogout}
          className="px-5 py-3 text-lg font-medium text-white bg-red-600 rounded-lg shadow hover:bg-red-700 focus:ring focus:ring-red-300 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Support Section */}
      <div className="mt-10 border-t border-gray-300 pt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Support</h2>
        <ul className="space-y-4">
          <li className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Contact Support</h3>
              <p className="text-sm text-gray-600">Reach out to our support team for assistance.</p>
            </div>
            <button className="px-4 py-2 text-white bg-green-900 rounded-lg hover:bg-green-700 focus:ring focus:ring-blue-300">
              Contact
            </button>
          </li>
          <li className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div>
              <h3 className="text-lg font-medium text-gray-800">FAQs</h3>
              <p className="text-sm text-gray-600">Find answers to frequently asked questions.</p>
            </div>
            <button className="px-4 py-2 text-white bg-green-900 rounded-lg hover:bg-green-700 focus:ring focus:ring-blue-300">
              View FAQs
            </button>
          </li>
        </ul>
      </div>

      {/* Edit Profile Popup */}
      {showEditPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Profile</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-gray-300 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Email (cannot be changed)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Email address cannot be changed for security reasons</p>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-medium text-gray-800 mb-2">Change Password (Optional)</h3>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisible.current ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-gray-300 pr-10 ${
                        errors.currentPassword ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {passwordVisible.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisible.new ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-gray-300 pr-10 ${
                        errors.newPassword ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {passwordVisible.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                  )}
                  {formData.newPassword && (
                    <p className={`text-sm mt-1 ${
                      formData.newPassword.length >= 8 ? "text-green-500" : "text-yellow-500"
                    }`}>
                      {formData.newPassword.length >= 8
                        ? "Password strength: Good"
                        : "Password must be at least 8 characters"}
                    </p>
                  )}
                </div>
              </div>
            </form>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowEditPopup(false)}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-4 py-2 text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring focus:ring-green-300 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
