import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { Button } from '../ui/Button';

export function GlobalNotification() {
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [invite, setInvite] = useState(null);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveInvite = (data) => {
            // data = { roomId, inviteToken, hostName, hostId }
            setInvite(data);
        };

        socket.on('receive-invite', handleReceiveInvite);
        return () => socket.off('receive-invite', handleReceiveInvite);
    }, [socket]);

    const handleAccept = () => {
        if (!invite) return;
        navigate(`/join/${invite.roomId}/${invite.inviteToken}`);
        setInvite(null);
    };

    const handleDecline = () => {
        if (!invite) return;
        // Tell the backend to notify the host that we declined
        socket.emit('decline-invite', {
            hostId: invite.hostId,
            guestName: 'Your partner' // Could be dynamic, but this is clean
        });
        setInvite(null);
    };

    return (
        <AnimatePresence>
            {invite && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
                >
                    <div className="backdrop-blur-xl bg-black/80 border border-primary/50 shadow-[0_0_30px_rgba(99,102,241,0.3)] rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/20 rounded-full shrink-0">
                                <Bell className="w-5 h-5 text-primary animate-bounce" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Watch Party Invite</h3>
                                <p className="text-slate-300 text-sm">
                                    <span className="text-primary font-semibold">{invite.hostName}</span> has invited you to join their private room.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <Button onClick={handleDecline} variant="secondary" className="flex-1">
                                <X className="w-4 h-4 mr-2" /> Decline
                            </Button>
                            <Button onClick={handleAccept} className="flex-1 bg-green-600 hover:bg-green-500 focus:ring-green-500 shadow-green-500/25">
                                <Check className="w-4 h-4 mr-2" /> Accept
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}