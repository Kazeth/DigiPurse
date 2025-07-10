import { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Navigate, Outlet } from 'react-router-dom';

export const UserRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState < boolean | null > (null);

  useEffect(() => {
    const checkUser = async () => {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
    }
  }, []);

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};
