import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';

const AuthContext = createContext();

const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app'
    : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
    });
  }, []);

  const login = async () => {
    if (!authClient) return;
    return new Promise((resolve) => {
      authClient.login({
        identityProvider,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal());
          setIsAuthenticated(authClient.isAuthenticated());
          setIsLoggedIn(true);
          console.log("Login successful");
          resolve(true);
        },
        onerror: () => resolve(false),
      });
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ authClient, isAuthenticated, principal, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);