import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Shield, History, Edit, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from '@/declarations/Registry_backend';

const mockTransactionHistory = [
    { id: 1, type: 'Purchase', details: 'Ticket for ICP Hackathon 2025', amount: -50, date: new Date('2025-07-20') },
    { id: 2, type: 'Sale', details: 'Sold ticket for Web3 Summit', amount: 120, date: new Date('2025-07-18') },
    { id: 3, type: 'Transfer', details: 'Sent ticket to principal: abcde-...-xyz', amount: 0, date: new Date('2025-07-15') },
];
// --- END MOCK DATA ---

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { authClient, isLoggedIn } = useAuth();
  const identity = authClient.getIdentity();
  const principal = identity.getPrincipal();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    // Directly map the input ID to the state property
    setUserProfile(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    if (!isEditing || !userProfile) return;
    setIsSaving(true);
    try {
      const actor = createActor(canisterId, { agentOptions: { identity } });
      // Construct the payload for the backend, ensuring all fields are present
      const profileToSave = {
        id: principal, // Assuming id is the principal
        name: userProfile.name,
        address: userProfile.address,
        joinDate: userProfile.joinDate, // Preserve existing joinDate
      };
      await actor.updateCustomerProfile(principal, profileToSave);
      setIsEditing(false); // Turn off editing mode on successful save
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
      async function fetchProfile() {
          if (!authClient || !identity || !principal || !isLoggedIn) return;
          const actor = createActor(canisterId, { agentOptions: { identity } });
          try {
              const profArr = await actor.getCustomerProfile(principal);
              if (profArr && profArr.length > 0) {
                setUserProfile(profArr[0]);
              } else {
                // If no profile exists, create a default one to avoid errors
                setUserProfile({ name: 'New User', address: '', joinDate: BigInt(Date.now() * 1000000) });
              }
          } catch (err) {
              console.error("Error fetching user profile:", err);
              setUserProfile(null);
          }
          setIsLoading(false);
      }
      fetchProfile();
  }, [isLoggedIn, authClient]);

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[#11071F]">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
      );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Profile Header */}
        <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-purple-500/50">
            <AvatarImage src={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?principal=${principal}`} alt="User Avatar" />
            <AvatarFallback className="text-4xl bg-purple-800/50">{userProfile ? userProfile.name.substring(0,2).toUpperCase() : principal.toText().substring(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold text-center sm:text-left"
              style={{ fontFamily: 'AeonikBold, sans-serif' }}
            >
              {userProfile ? userProfile.name : 'N/A'}
            </h1>
            <p
              className="text-sm text-purple-300/70 text-center sm:text-left mt-1 truncate max-w-xs sm:max-w-md"
              style={{ fontFamily: 'AeonikLight, sans-serif' }}
            >
              Principal ID: {principal.toText()}
            </p>
            {userProfile && (
              <p
                className="text-sm text-purple-300/70 text-center sm:text-left"
                style={{ fontFamily: 'AeonikLight, sans-serif' }}
              >
                Joined: {new Date(Number(userProfile.joinDate) / 1000000).toLocaleDateString()}
              </p>
            )}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-purple-400/20 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn("flex items-center gap-2 p-4 font-semibold transition-colors", activeTab === 'profile' ? 'text-white border-b-2 border-purple-400' : 'text-purple-300/70 hover:text-white')}
            style={{ fontFamily: 'AeonikBold, sans-serif' }}
          >
            <User className="h-5 w-5" /> Profile Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn("flex items-center gap-2 p-4 font-semibold transition-colors", activeTab === 'history' ? 'text-white border-b-2 border-purple-400' : 'text-purple-300/70 hover:text-white')}
            style={{ fontFamily: 'AeonikBold, sans-serif' }}
          >
            <History className="h-5 w-5" /> Transaction History
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={cn("flex items-center gap-2 p-4 font-semibold transition-colors", activeTab === 'security' ? 'text-white border-b-2 border-purple-400' : 'text-purple-300/70 hover:text-white')}
            style={{ fontFamily: 'AeonikBold, sans-serif' }}
          >
            <Shield className="h-5 w-5" /> Security
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && (
            <Card className="bg-white/5 border-purple-400/20">
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle
                    style={{ fontFamily: 'AeonikBold, sans-serif' }}
                  >
                    Personal Information
                  </CardTitle>
                  <CardDescription
                    style={{ fontFamily: 'AeonikLight, sans-serif' }}
                  >
                    View and edit your profile details.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={isSaving}
                  style={{ fontFamily: 'AeonikBold, sans-serif' }}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isEditing ? (
                    <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                  ) : (
                    <><Edit className="mr-2 h-4 w-4" /> Edit Profile</>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label
                      htmlFor="name"
                      style={{ fontFamily: 'AeonikLight, sans-serif' }}
                    >
                      Username
                    </Label>
                    <Input
                      id="name"
                      value={userProfile?.name || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-black/20 border-purple-400/30"
                      style={{ fontFamily: 'AeonikLight, sans-serif' }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="address"
                      style={{ fontFamily: 'AeonikLight, sans-serif' }}
                    >
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={userProfile?.address || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-black/20 border-purple-400/30"
                      style={{ fontFamily: 'AeonikLight, sans-serif' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card className="bg-white/5 border-purple-400/20">
              <CardHeader>
                <CardTitle
                  style={{ fontFamily: 'AeonikBold, sans-serif' }}
                >
                  Transaction History
                </CardTitle>
                <CardDescription
                  style={{ fontFamily: 'AeonikLight, sans-serif' }}
                >
                  A record of your recent on-chain activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {mockTransactionHistory.map(tx => (
                    <li key={tx.id} className="flex justify-between items-center p-3 bg-black/20 rounded-md">
                      <div>
                        <p
                          className="font-semibold"
                          style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                          {tx.type}
                        </p>
                        <p
                          className="text-sm text-purple-300/70"
                          style={{ fontFamily: 'AeonikLight, sans-serif' }}
                        >
                          {tx.details}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn("font-bold", tx.amount > 0 ? "text-green-400" : "text-red-400")}
                          style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                          {tx.amount !== 0 && `${tx.amount > 0 ? '+' : ''}${tx.amount} ICP`}
                        </p>
                        <p
                          className="text-xs text-purple-300/70"
                          style={{ fontFamily: 'AeonikLight, sans-serif' }}
                        >
                          {tx.date.toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-white/5 border-purple-400/20">
              <CardHeader>
                <CardTitle
                  style={{ fontFamily: 'AeonikBold, sans-serif' }}
                >
                  Security Settings
                </CardTitle>
                <CardDescription
                  style={{ fontFamily: 'AeonikLight, sans-serif' }}
                >
                  Manage your account security.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-purple-300/70">
                <p
                  style={{ fontFamily: 'AeonikLight, sans-serif' }}
                >
                  Security management features are coming soon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}