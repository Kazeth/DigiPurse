import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from 'declarations/Registry_backend';
import LoadingScene from '@/components/LoadingScene';

export const UserRoute = () => {
  const { isAuthenticated, principal, identity } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(null);

  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated) {
        try {
          const actor = createActor(canisterId, { agentOptions: { identity } });
          const exist = await actor.checkUserExist(principal);
          setUserExists(exist);
        } catch (err) {
          console.error('Error checking user profile:', err);
          setUserExists(false); // fallback
        } finally {
          setLoading(false);
        }
      }
    };

    checkProfile();
  }, [isAuthenticated, principal, identity]);
  console.log("user")
  if (isAuthenticated === null || loading || userExists === null) {
    return <LoadingScene />;
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!userExists) return <Navigate to="/postlogin" replace />;

  return <Outlet />;
};
