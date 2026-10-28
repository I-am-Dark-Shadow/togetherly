import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, AlertCircle } from 'lucide-react';

export default function JoinRoom() {
    const { id, token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('joining'); // joining, error
    const [errorMessage, setErrorMessage] = useState('');

    // Use a ref to prevent double-firing React 18 strict mode effects
    const attemptMade = useRef(false);

    useEffect(() => {
        const attemptJoin = async () => {
            if (attemptMade.current) return;
            attemptMade.current = true;

            try {
                await axiosInstance.post(`/rooms/${id}/join`, { token });
                // On success, redirect to the room
                navigate(`/room/${id}`, { replace: true });
            } catch (err) {
                setStatus('error');
                setErrorMessage(err.response?.data?.message || 'Invalid or expired invite link.');
            }
        };

        attemptJoin();
    }, [id, token, navigate]);

    if (status === 'error') {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
                <Card className="max-w-md w-full p-8 text-center border-red-500/30">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-slate-300 mb-8">{errorMessage}</p>
                    <Button onClick={() => navigate('/')} className="w-full">
                        Return to Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-200">Joining secure room...</h2>
        </div>
    );
}