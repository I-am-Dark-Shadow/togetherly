import { Users } from 'lucide-react';
import { Card } from '../ui/Card';

export function UsersList({ roomData, activeUserIds }) {
    if (!roomData) return null;

    const hostActive = activeUserIds.includes(roomData.hostId._id);
    const guestActive = roomData.guestId && activeUserIds.includes(roomData.guestId._id);

    return (
        <Card className="p-4 h-full min-h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-glassBorder">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Room Members</h3>
            </div>

            <div className="space-y-4 flex-1">
                {/* Host */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white shadow-lg">
                            {roomData.hostId.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-cinematic ${hostActive ? 'bg-green-500' : 'bg-slate-500'}`} title={hostActive ? 'Online' : 'Offline'} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                            {roomData.hostId.username} <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">Host</span>
                        </span>
                    </div>
                </div>

                {/* Guest */}
                {roomData.guestId ? (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                {roomData.guestId.username.charAt(0).toUpperCase()}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-cinematic ${guestActive ? 'bg-green-500' : 'bg-slate-500'}`} title={guestActive ? 'Online' : 'Offline'} />
                        </div>
                        <span className="text-sm font-bold text-white">{roomData.guestId.username}</span>
                    </div>
                ) : (
                    <div className="text-sm text-slate-500 italic px-2 border border-dashed border-glassBorder p-3 rounded-xl text-center">
                        Waiting for partner to join...
                    </div>
                )}
            </div>
        </Card>
    );
}