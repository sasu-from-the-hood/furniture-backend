import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../compontes/context/ShopContext";
import AdminApp from "../admin/index.jsx";

function Dashboard() {
  const { isAdmin, token } = useContext(ShopContext);
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login");
    }
  }, [token, isAdmin, navigate]);

  // Apply full-width styles to the dashboard and hide any headers/footers
  useEffect(() => {
    // Add styles to make the dashboard take full width
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    // Hide any headers or footers that might be visible
    const headers = document.querySelectorAll('header');
    const footers = document.querySelectorAll('footer');
    const searchBars = document.querySelectorAll('.search-bar');

    headers.forEach(header => { header.style.display = 'none'; });
    footers.forEach(footer => { footer.style.display = 'none'; });
    searchBars.forEach(searchBar => { searchBar.style.display = 'none'; });

    // Cleanup function to restore original styles when component unmounts
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';

      headers.forEach(header => { header.style.display = ''; });
      footers.forEach(footer => { footer.style.display = ''; });
      searchBars.forEach(searchBar => { searchBar.style.display = ''; });
    };
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }}>
      <AdminApp />
    </div>
  );
}

export default Dashboard;
