import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();
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
        <div className='overflow-x-hidden flex flex-col items-start'>
            <div>

            </div>
            <div className='flex flex-col items-start'>
                <div className='flex mt-100vw'>
                    What do you want to manage today??
                </div>
                <div>
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