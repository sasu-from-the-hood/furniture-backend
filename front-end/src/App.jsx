import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Shop from "./compontes/sections/Shop.jsx";
import ProductDetail from "./compontes/sections/ProductDetail.jsx";
import Cart from "./compontes/ui/Cart.jsx";
import NotFound from "./pages/NotFound.jsx";
import OrderPage from "./pages/OrderPage.jsx";
import TrackOrder from "./compontes/ui/TrackOrder.jsx";
import PaymentConfirmation from "./compontes/ui/PaymentConfirmation.jsx";

import Footer from "./compontes/sections/Footer.jsx";
import Login from "./pages/Login.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./compontes/sections/Header.jsx";
import SearchBar from "./compontes/ui/SearchBar.jsx";
import About from "./compontes/sections/About.jsx";
import ShopContextProvider from "./compontes/context/ShopContext.jsx";

// Layout component that conditionally renders header and footer
function AppLayout({ children }) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');

  if (isDashboard) {
    // For dashboard, render only the content without header or footer
    return <>{children}</>;
  }

  // For all other pages, render with header and footer
  return (
    <>
      <Header />
      <SearchBar />
      <div className="h-[100px] md:h-[110px]"></div>
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ShopContextProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart/:productId" element={<Cart />} />
            <Route path="/order-page" element={<OrderPage />} />
            <Route path="/orders" element={<TrackOrder />} />
            <Route path="/orders/confirmation" element={<PaymentConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </AppLayout>
        <ToastContainer />
      </BrowserRouter>
    </ShopContextProvider>
  );
}

export default App;
