import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from 'react-admin';

/**
 * Home resource component that redirects to the main site home page
 */
const HomeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the home page
    window.location.href = '/';
  }, [navigate]);

  // Show loading while redirecting
  return <Loading />;
};

export default HomeRedirect;
