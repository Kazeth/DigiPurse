import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { createActor , canisterId } from "../declarations/Registry_backend";
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Camera } from 'lucide-react';


export default function PostLoginPage() {
  const navigate = useNavigate();
  const [actor, setActor] = useState();
  const { authClient, isAuthenticated, principal } = useAuth();

  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    updateActor();
  }, []);

  async function updateActor() {
    if (!isAuthenticated) return;
    const identity = authClient.getIdentity();
    const actor = createActor(canisterId, { agentOptions: { identity } });
    setActor(actor);
    console.log("Actor initialized:", actor);
  }

  async function uploadProfile() {
    if (!actor || !authClient) {
      console.error("Actor is not initialized");
      return;
    }
    try {
      const dateObj = new Date(dob);
      const timeNat = BigInt(dateObj.getTime()) * 1_000_000n; // Convert date to nanoseconds
      await actor.registerCustomer(principal, {
        id: principal,
        name: username,
        joinDate: timeNat,
        address: address
      });
      console.log("Profile data saved:", { username, dob, address });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  }
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      // In a real app, you would also set the file object to state
      // e.g., setProfileImageFile(file);
    }
  };

  const handleContinue = async () => {
    // Here you would typically save all the user data to your backend.
    console.log({
      username,
      dob,
      address,
      // profileImageFile would be uploaded here
    });
    uploadProfile();
    navigate('/home');
  };

  const areRequiredFieldsFilled = () => {
    return username.trim() !== '' && dob.trim() !== '' && address.trim() !== '';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#2B0B3F] to-[#11071F] py-12">
      <Card className="w-full max-w-md mx-4 bg-white/5 border-purple-400/20 text-white backdrop-blur-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10">
              <UserPlus className="h-8 w-8 text-purple-300" />
            </div>
          </div>
          <CardTitle className="text-3xl text-white">Welcome to DigiPurse!</CardTitle>
          <CardDescription className="text-purple-300/80 pt-2">
            Just one more step. Let's set up your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-2">
            <Label htmlFor="profile-picture">Profile Picture</Label>
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={imagePreview || undefined} alt="Profile preview" />
                <AvatarFallback className="bg-purple-900/50 text-purple-300">
                  <UserPlus className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="profile-picture"
                className="absolute bottom-0 right-0 flex items-center justify-center h-8 w-8 bg-white rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <Camera className="h-5 w-5 text-[#4C1D95]" />
                <input id="profile-picture" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username" className="text-purple-300">Username</Label>
              <Input
                id="username"
                placeholder="e.g., vitalik.eth"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/20 border-purple-400/30 text-white placeholder:text-purple-400/50 focus:border-purple-400"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="dob" className="text-purple-300">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="bg-black/20 border-purple-400/30 text-white placeholder:text-purple-400/50 focus:border-purple-400"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="address" className="text-purple-300">Address</Label>
              <Input
                id="address"
                placeholder="123 Blockchain Ave"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-black/20 border-purple-400/30 text-white placeholder:text-purple-400/50 focus:border-purple-400"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-white text-[#4C1D95] hover:bg-gray-200"
            onClick={handleContinue}
            disabled={!areRequiredFieldsFilled()}
          >
            Continue to App
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
