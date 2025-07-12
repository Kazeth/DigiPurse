import { Button } from '@/components/ui/button';

export default function HomePage() {
    return (
        <div className='overflow-x-hidden flex flex-col items-start'>
            <div>

            </div>
            <div className='flex flex-col items-start'>
                <div className='flex mt-100vw'>
                    What do you want to manage today??
                </div>
                <div>
                    <Button>
                        Documents
                    </Button>                    
                    <Button>
                        Tickets
                    </Button>                    
                    <Button>
                        Payments
                    </Button>
                </div>
            </div>
        </div>
    )
}