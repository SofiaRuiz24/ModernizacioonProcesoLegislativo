import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }
      try {
        const res = await fetch('/api/validate-token', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };
    validateToken();
  }, []);

  if (isValidating) return null; // O un loader
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
} 