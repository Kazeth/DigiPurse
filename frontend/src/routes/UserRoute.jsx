import { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Navigate, Outlet } from 'react-router-dom';

export const UserRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    console.log('checking user');
    const checkUser = async () => {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
    }
    checkUser();
  }, []);

  if (isAuthenticated == null) return <div>Loading...</div>

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};
