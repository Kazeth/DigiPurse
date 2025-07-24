import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from '@/declarations/Registry_backend';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { authClient, isAuthenticated, principal } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [registry, setRegistry] = useState(null);

  useEffect(() => {
    declareActors();
  },[]);

  useEffect(() => {
    async function fetchProfile() {
        if(isAuthenticated) {
            const profArr = await registry.getCustomerProfile(authClient.getIdentity().getPrincipal());
            // console.log("Fetched user profile:", profArr);
            setUserProfile(profArr && profArr.length > 0 ? profArr[0] : null);
        } 
        else {
            console.log("User is not authenticated, cannot fetch profile");
            setUserProfile(null);
        }
    }
    fetchProfile();
  }, [registry]);

  const declareActors = async () => {
    if (!authClient) {
      console.error("No authClient found");
      return;
    }
    const identity = authClient.getIdentity();
    const registryActor = await createActor(canisterId, { agentOptions: { identity } });
    await setRegistry(registryActor);
  }
//   const updateProfile = async (profileData) => {
//     if (!authClient) {
//       console.error("No authClient found");
//       return;
//     }
//     const identity = authClient.getIdentity();
//     const actor = createActor(canisterId, { agentOptions: { identity } });
//     try {
//       await actor.updateCustomerProfile(identity.getPrincipal(), profileData);
//     } catch (err) {
//       console.error("Failed to update user profile:", err);
//     }
//   };
    
  const uploadProfile = async (profileData) => {
    if (!authClient) {
      console.error("No authClient found");
      return;
    }
    try {
      await registry.registerCustomer(authClient.getIdentity().getPrincipal(), {
        id: authClient.getIdentity().getPrincipal(),
        name: profileData.name,
        joinDate: profileData.joinDate,
        address: profileData.address
      });
    } catch (err) {
      console.error("Failed to upload user profile:", err);
    }
  };

  return (
    <UserContext.Provider value={{ userProfile, uploadProfile, registry }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
