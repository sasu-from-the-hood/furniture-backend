import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import { ShopContext } from "../context/ShopContext";

function Header() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuVisible, setVisible] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const {
    cartSize,
    token,
    setShowSearch,
    isAdmin,
    userRole,
    username,
    userEmail,
    logout: contextLogout
  } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle header visibility and compactness when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Make header compact when scrolled down
      if (currentScrollY > 50) {
        setIsCompact(true);
      } else {
        setIsCompact(false);
      }

      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past a threshold – hide header
        setShowHeader(false);
      } else {
        // Scrolling up – show header
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    contextLogout();
    navigate("/login");
    setIsDropdownOpen(false);
  };

  return (
    // The header is always rendered in its position,
    // but we apply a transition that moves it off-screen when not visible.
    <header
      className={`
        site-header fixed top-0 left-0 w-full z-50 bg-white shadow-md
        transition-all duration-300
        ${showHeader ? "translate-y-0" : "-translate-y-full"}
        ${isCompact ? "py-1" : "py-3"}
      `}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/">
          <img
            className={`transition-all duration-300 ${isCompact ? "h-[50px]" : "h-[80px]"} w-auto`}
            src={logo}
            alt="logo"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6 text-lg font-medium text-gray-700">
          <NavLink to="/" className="hover:text-black transition py-2">
            Home
          </NavLink>
          <NavLink to="/shop" className="hover:text-black transition py-2">
            Shop
          </NavLink>
          <NavLink to="/about" className="hover:text-black transition py-2">
            About
          </NavLink>
          {isAdmin && (
            <NavLink to="/dashboard" className="hover:text-black transition py-2 text-green-700 font-semibold">
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-6">
          {location.pathname.includes("shop") && (
            <svg
              onClick={() => setShowSearch(true)}
              className="cursor-pointer w-6 h-6 text-gray-700 hover:text-black transition"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          )}

          {/* Conditional rendering based on login status */}
          {token ? (
            <>
              {/* Cart Icon - Only show when logged in */}
              <div className="relative">
                <Link to="/cart/1">
                  <svg
                    className="w-6 h-6 text-gray-700 hover:text-black transition"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 6h15l-1.5 9h-12l-1.5-9zm1 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm10 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"></path>
                  </svg>
                </Link>
                {cartSize > 0 && (
                  <span className="absolute -top-1 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartSize}
                  </span>
                )}
              </div>

              {/* User Profile Icon - Only show when logged in */}
              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <svg
                    className="w-6 h-6 text-green-700 hover:text-black transition cursor-pointer"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"></path>
                  </svg>
                </button>

                <div
                  className={`absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 border border-gray-200 transition-all duration-200 ${
                    isDropdownOpen ? "opacity-100 visible transform translate-y-0" : "opacity-0 invisible transform -translate-y-2"
                  }`}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Hello, {username || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail || ''}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Orders
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-green-700 hover:bg-gray-100 hover:text-green-900"
                    >
                      Dashboard
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 border-t border-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Login Button - Only show when logged out */
            <Link
              to="/login"
              className="px-4 py-1.5 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Icon */}
          <svg
            onClick={() => setVisible(true)}
            className="md:hidden w-6 h-6 text-gray-700 cursor-pointer"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>
      </div>

      {/* Mobile Menu (if visible) */}
      <div
        className={`
          fixed top-0 right-0 h-screen bg-white shadow-lg transform transition-transform duration-300 overflow-hidden z-50
          ${menuVisible ? "w-64" : "w-0"}
        `}
      >
        <div className="flex flex-col text-gray-700 p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Menu</h2>
            <svg
              onClick={() => setVisible(false)}
              className="w-6 h-6 cursor-pointer"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>

          {token && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="font-medium">Hello, {username || 'User'}</p>
              <p className="text-sm text-gray-500 truncate">{userEmail || ''}</p>
            </div>
          )}

          <NavLink to="/" className="py-3 border-b border-gray-100" onClick={() => setVisible(false)}>
            Home
          </NavLink>
          <NavLink
            to="/shop"
            className="py-3 border-b border-gray-100"
            onClick={() => setVisible(false)}
          >
            Shop
          </NavLink>
          <NavLink
            to="/about"
            className="py-3 border-b border-gray-100"
            onClick={() => setVisible(false)}
          >
            About
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/dashboard"
              className="py-3 border-b border-gray-100 text-green-700 font-semibold"
              onClick={() => setVisible(false)}
            >
              Dashboard
            </NavLink>
          )}

          {token && (
            <>
              <NavLink
                to="/profile"
                className="py-3 border-b border-gray-100"
                onClick={() => setVisible(false)}
              >
                My Profile
              </NavLink>
              <NavLink
                to="/orders"
                className="py-3 border-b border-gray-100"
                onClick={() => setVisible(false)}
              >
                Orders
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  setVisible(false);
                }}
                className="py-3 text-left text-red-600 mt-4"
              >
                Logout
              </button>
            </>
          )}

          {!token && (
            <NavLink
              to="/login"
              className="py-3 mt-4 bg-green-700 text-white text-center rounded"
              onClick={() => setVisible(false)}
            >
              Login / Register
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
