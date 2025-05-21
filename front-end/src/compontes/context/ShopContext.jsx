import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import { API_URL, getAuthHeaders, clearAuth } from "../../config/index";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const BASE_URL = API_URL;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  // Initialize selectedCategory to 0 (All products)
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [cart, setCart] = useState([]);
  const [cartSize, setCartSize] = useState(0);

  const [orders, setOrders] = useState([]);

  // Settings state
  const [settings, setSettings] = useState({});
  const [siteSettings, setSiteSettings] = useState({
    // General settings
    site_name: 'Furniture Catalog',
    site_description: 'Quality furniture for your home',
    site_logo: '',
    site_favicon: '',

    // Contact settings
    contact_email: '',
    contact_phone: '',
    contact_address: '',

    // Social settings
    social_facebook: '',
    social_instagram: '',

    // Home settings
    hero_title: 'Elegant Furniture for Modern Living',
    hero_subtitle: 'Transform your space with our exclusive collection',
    why_choose_us_title: 'Why Choose Us?',
    why_choose_us_reasons: [],
    video_url: '',
    testimonials: []
  });

  const deliveryFee = 200;

  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)





  const fetchData = useCallback(async (url, setter, options = {}) => {
    setLoading(true);
    setError(null);
    console.log("Fetching data from:", url);
    try {
      const response = await fetch(url, {
        ...options, // Spread any additional options
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setter(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);




  const getCartSize = useCallback((cartData = cart) => {
    let count = 0;

    try {
      for (const item of cartData) {
        if (item.quantity > 0) {
          count += item.quantity;
        }
      }
    } catch (error) {
      console.error("Error calculating cart size:", error);
    }

    return count;
  }, [cart]);

  const getCart = useCallback(async () => {
    let cart = null;
    const headers = getAuthHeaders();

    await fetchData(`${BASE_URL}/user/cart`, (data) => {
      cart = data;
      setCart(data);
      setCartSize(getCartSize(data));
    }, { headers });

    return cart;
  }, [fetchData, BASE_URL, getCartSize]);


  useEffect(() => {
    const size = getCartSize();
    setCartSize(size);
    console.log("Cart size updated:", size);
    console.log("cart", cart)
  }, [cart, getCartSize]);

  const getOrders = useCallback(async () => {
    let order = null;
    const headers = getAuthHeaders();

    await fetchData(`${BASE_URL}/user/orders`, (data) => {
      order = data;
      setOrders(data);
    }, { headers });

    return order;
  }, [fetchData, BASE_URL]);



  // Function to fetch settings
  const getSettings = useCallback(async (group = null) => {
    let url = `${BASE_URL}/superadmin/settings`;
    if (group) {
      url += `?group=${group}`;
    }

    await fetchData(url, (data) => {
      if (data && data.settings) {
        setSettings(data.settings);

        // Extract site settings
        const newSettings = {
          // General settings
          site_name: data.settings.general?.site_name?.value || 'Furniture Catalog',
          site_description: data.settings.general?.site_description?.value || 'Quality furniture for your home',
          site_logo: data.settings.general?.site_logo?.value || '',
          site_favicon: data.settings.general?.site_favicon?.value || '',

          // Contact settings
          contact_email: data.settings.contact?.contact_email?.value || '',
          contact_phone: data.settings.contact?.contact_phone?.value || '',
          contact_address: data.settings.contact?.contact_address?.value || '',

          // Social settings
          social_facebook: data.settings.social?.social_facebook?.value || '',
          social_instagram: data.settings.social?.social_instagram?.value || '',

          // Home settings
          hero_title: data.settings.home?.hero_title?.value || 'Elegant Furniture for Modern Living',
          hero_subtitle: data.settings.home?.hero_subtitle?.value || 'Transform your space with our exclusive collection',
          why_choose_us_title: data.settings.home?.why_choose_us_title?.value || 'Why Choose Us?',
          why_choose_us_reasons: data.settings.home?.why_choose_us_reasons?.value || [],
          video_url: data.settings.home?.video_url?.value || '',
          testimonials: data.settings.home?.testimonials?.value || []
        };

        setSiteSettings(newSettings);
      }
    });
  }, [BASE_URL, fetchData]);

  // Fetch all products and settings
  useEffect(() => {
    fetchData(`${BASE_URL}/superadmin/products`, (data) => {
      if (data && data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        console.log("All products fetched:", data.products.length);
      } else {
        console.log("No products found in the response");
        setProducts([]);
      }
    });
    getSettings();
  }, [fetchData, setProducts, getSettings, BASE_URL]);

  // Store token

  // Load user data from localStorage
  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));

      // Load user role information if available
      const storedRole = localStorage.getItem("userRole");
      const storedUserType = localStorage.getItem("userType");
      const storedIsAdmin = localStorage.getItem("isAdmin") === "true";

      if (storedRole) setUserRole(storedRole);
      if (storedUserType && !storedRole) setUserRole(storedUserType);
      setIsAdmin(storedIsAdmin);
    }
  }, [token]);

  // Persist user role changes to localStorage
  useEffect(() => {
    if (userRole) {
      localStorage.setItem("userRole", userRole);
    }
  }, [userRole]);

  // Fetch a single product by ID
  const getProductById = useCallback(
    async (productId) => {
      let product = null;
      setLoading(true);
      try {
        await fetchData(`${BASE_URL}/superadmin/products/${productId}`, (data) => {
          console.log("Product API response:", data);
          // Extract the product from the response
          if (data && data.product) {
            product = data.product;
          } else {
            product = data; // Fallback to the entire response if no nested product
          }
        });

        // Ensure product has an images array
        if (product && !product.images) {
          product.images = [];
        }

        return product;
      } catch (error) {
        console.error("Error in getProductById:", error);
        setError("Failed to fetch product details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, BASE_URL, setLoading, setError]
  );

  const getCategories = useCallback(async () => {
    await fetchData(`${BASE_URL}/superadmin/categories/tree`, (data) => {
      if (data && data.categoryTree) {
        setCategories(data.categoryTree);
      } else {
        setCategories([]);
      }
    });
  }, [fetchData, BASE_URL]);

  // Function to fetch products by category
  const getProductsByCategory = useCallback(
    async (categoryId) => {
      if (!categoryId) {
        console.error("Invalid categoryId:", categoryId);
        return;
      }

      setLoading(true);

      try {
        // Get products by category ID
        const url = `${BASE_URL}/superadmin/products?categoryId=${categoryId}`;

        await fetchData(
          url,
          (data) => {
            if (data && data.products && Array.isArray(data.products)) {
              setCategoryProducts({ furniture: data.products });
            } else if (data && Array.isArray(data)) {
              // Handle case where API returns array directly
              setCategoryProducts({ furniture: data });
            } else {
              setCategoryProducts({ furniture: [] });
            }
          }
        );
      } catch (error) {
        console.error("Error fetching products by category:", error);
        setCategoryProducts({ furniture: [] });
      } finally {
        setLoading(false);
      }
    },
    [fetchData, BASE_URL, setLoading, setCategoryProducts]
  );

  // Custom function to set the selected category and fetch products if needed
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);

    // If it's not the "All" category (0), fetch the products for this category
    if (categoryId !== 0) {
      getProductsByCategory(categoryId);
    }
  }, [setSelectedCategory, getProductsByCategory]);


  const checkout = async (formData, selectedItems = null) => {
    // Use selectedItems if provided, otherwise use the full cart
    const itemsToOrder = Array.isArray(selectedItems) && selectedItems.length > 0 ? selectedItems : cart;
    const orderData = {
      user: formData,
      items: itemsToOrder,
      totalAmount:
        itemsToOrder.reduce(
          (sum, item) => sum + item.furniture.price * item.quantity,
          0
        ) + deliveryFee,
    };

    try {
      // Post to backend
      console.log(orderData)
      const response = await fetch(`${BASE_URL}/user/orders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        let errorMsg = "Failed to process order";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      // Update orders and clear cart
      setOrders((prevOrders) => [...prevOrders, orderData]);
      setCart([]);
      toast.success("Order placed successfully!");
      // Redirect to orders page handled by the component that calls this function
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    }
  };

  const logout = () => {
    clearAuth();
    setToken('');
    setUsername('');
    setUserEmail('');
    setUserRole(null);
    setUserPermissions(null);
    setIsAdmin(false);
  }



  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        categoryProducts, selectedCategory,
        cart,
        cartSize, orders,
        loading,
        error,
        token,
        deliveryFee,
        search, showSearch, BASE_URL,
        username, userEmail, userRole, userPermissions, isAdmin,
        settings, siteSettings,
        setSearch, setShowSearch,
        setToken,
        getProductById,
        getCategories,
        setSelectedCategory,
        handleCategoryChange,
        getProductsByCategory,
        setCategoryProducts,
        getCart, setCart, getCartSize, getOrders,
        getSettings,
        checkout,
        setUsername, setUserEmail,
        setUserRole, setUserPermissions, setIsAdmin,
        logout,
      }}
    >
      {props.children}
    </ShopContext.Provider>
  );
};
ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ShopContextProvider;
