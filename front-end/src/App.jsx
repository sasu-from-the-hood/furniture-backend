import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Shop from "./compontes/sections/Shop.jsx";
import ProductDetail from "./compontes/sections/ProductDetail.jsx";
import Cart from "./compontes/ui/Cart.jsx";
import NotFound from "./pages/NotFound.jsx";
import OrderPage from "./pages/OrderPage.jsx";
import TrackOrder from "./compontes/ui/TrackOrder.jsx";

import Footer from "./compontes/sections/Footer.jsx";
import Login from "./pages/Login.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./compontes/sections/Header.jsx";
import SearchBar from "./compontes/ui/SearchBar.jsx";
import About from "./compontes/sections/About.jsx";
import ShopContextProvider from "./compontes/context/ShopContext.jsx";

function Layout() {
  return (
    <>
      <Header />
      <SearchBar />
      <div className="h-[110px]"></div>
      <Outlet /> {/* This renders the current route's element */}
      <Footer />
    </>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      path: '',
      element: <Layout />,
      errorElement: <NotFound />,
      children: [ // Nested routes
        { path: '', element: <Home /> },
        { path: '/shop', element: <Shop /> },
        { path: 'product/:productId', element: <ProductDetail /> },
        { path: '/cart/:productId', element: <Cart /> },
        { path: '/order-page', element: <OrderPage /> },
        { path: '/orders', element: <TrackOrder /> },
        { path: '/login', element: <Login /> },
        { path: '/about', element: <About /> },
        { path: '/profile', element: <MyProfile /> },
      ],
    },
  ],
  );

  return (
    <>
      <ShopContextProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </ShopContextProvider>
    </>
  );
}

export default App;
