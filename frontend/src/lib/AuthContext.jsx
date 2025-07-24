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
      console.log("AuthClient created:", client);
      if (client.isAuthenticated()) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal());
        setIsAuthenticated(true);
      }
    });
  }, []);

  const login = async () => {
    if (!authClient) return;
    return new Promise((resolve) => {
      authClient.login({
        identityProvider,
        onSuccess: async () => {
          console.log("Login successful");
          setPrincipal(authClient.getIdentity().getPrincipal());
          setIsAuthenticated(true);
          setIsLoggedIn(true);
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