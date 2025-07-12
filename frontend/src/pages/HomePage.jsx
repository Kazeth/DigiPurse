import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; import { AuthClient } from '@dfinity/auth-client';

export default function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authClient, setAuthClient] = useState(null);
    const [principalId, setPrincipalId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        AuthClient.create().then(async (client) => {
            setAuthClient(client);
            const authenticated = await client.isAuthenticated();
            setIsAuthenticated(authenticated);
            if (authenticated) {
                const identity = client.getIdentity();
                setPrincipalId(identity.getPrincipal().toText());    
            }
        });
    }, []);

    const gotoDocuments = async () => {
        navigate('/digidocument');
    }
    const gotoTickets = async () => {
        navigate('/digiticket');
    }
    const gotoPayments = async () => {
        navigate('/digipayment');
    }
    return (
        <div className='h-[90vh] flex flex-col items-start'>
            <div className='container mx-auto flex items-center justify-between p-4 text-white border-b border-white border-solid'>
                <div>
                    <div>
                        Welcome back,
                    </div>
                    <div className='ml-[1vw] text-[3vw]'>
                        User
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/postlogin">
                        <Avatar className='w-[10vw] h-[20vh] text-[4vw]'>
                            <AvatarImage src={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?principal=${principalId}`} alt="User Avatar" />
                            <AvatarFallback>{principalId?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </div>
            <div className='container mx-auto mt-[4vh] flex flex-col items-start p-4'>
                <div className='container mx-auto flex text-[2vw]'>
                    What do you want to manage today??
                </div>
                <div className='mt-[2vh] ml-[1vw] w-6vw flex flex-row justify-around items-start gap-4'>
                    <Button onClick={gotoDocuments}>
                        Documents
                    </Button>
                    <Button onClick={gotoTickets}>
                        Tickets
                    </Button>
                    <Button onClick={gotoPayments}>
                        Payments
                    </Button>
                </div>
            </div>
        </div>
    )
}