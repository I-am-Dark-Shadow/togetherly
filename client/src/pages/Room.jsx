import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useRoomSync } from '../hooks/useRoomSync';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { UsersList } from '../components/room/UsersList';
import { Chat } from '../components/room/Chat';
import { MediaPlayer } from '../components/media/MediaPlayer';
import { MediaCard } from '../components/media/MediaCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { axiosInstance } from '../lib/axios';
import { Loader2, Copy, Check, Link as LinkIcon, Search, Send, Library } from 'lucide-react';

export default function Room() {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const { socket, isConnected } = useSocket();

    const { roomData, activeUserIds, error, isLoading, mediaUrl, updateMediaUrl } = useRoomSync(id);

    const [copied, setCopied] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteStatus, setInviteStatus] = useState('');

    // NEW: Catalog states
    const [catalog, setCatalog] = useState([]);
    const [favorites, setFavorites] = useState(authUser?.favorites || []);

    const inviteToken = searchParams.get('invite');
    const autoPlayUrl = searchParams.get('play');
    const isHost = roomData?.hostId?._id === authUser?._id;

    // 1. Fetch entire catalog for the Room UI
    useEffect(() => {
        axiosInstance.get('/media').then(res => setCatalog(res.data)).catch(console.error);
    }, []);

    // 2. Auto-play the video if we navigated from the Home page clicking a card
    useEffect(() => {
        if (isHost && autoPlayUrl && isConnected) {
            updateMediaUrl(autoPlayUrl);
            // Remove 'play' from URL to prevent re-triggering
            searchParams.delete('play');
            setSearchParams(searchParams, { replace: true });
        }
    }, [isHost, autoPlayUrl, isConnected, updateMediaUrl, searchParams, setSearchParams]);

    // 3. Listen for invite declines
    useEffect(() => {
        if (!socket) return;
        const handleDeclined = ({ guestName }) => {
            setInviteStatus(`${guestName} declined.`);
            setTimeout(() => setInviteStatus(''), 5000);
        };
        socket.on('invite-declined', handleDeclined);
        return () => socket.off('invite-declined', handleDeclined);
    }, [socket]);

    // Actions
    const handleCopyLink = () => {
        const inviteLink = `${window.location.origin}/join/${id}/${inviteToken}`;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        searchParams.delete('invite');
        setSearchParams(searchParams, { replace: true });
    };

    const handleSendInvite = (e) => {
        e.preventDefault();
        if (!inviteUsername.trim()) return;
        setInviteStatus('Sending...');
        socket.emit('send-inapp-invite', { targetUsername: inviteUsername.trim(), roomId: id, inviteToken }, (res) => {
            setInviteStatus(res.error ? `Error: ${res.error}` : 'Invite sent!');
            setInviteUsername('');
            setTimeout(() => setInviteStatus(''), 5000);
        });
    };

    const handleLoadManualVideo = (e) => {
        e.preventDefault();
        if (!urlInput.trim()) return;
        updateMediaUrl(urlInput.trim());
        setUrlInput('');
    };

    // NEW: Host clicked a movie/song from the bottom catalog
    const handleSelectCatalogItem = (media) => {
        if (!isHost) return;
        updateMediaUrl(media.mediaUrl);
    };

    // NEW: Auto-play next song from playlist logic
    const handleMediaEnded = () => {
        if (!isHost) return;

        // Find what is currently playing
        const currentMedia = catalog.find(m => m.mediaUrl === mediaUrl);
        if (currentMedia && currentMedia.type === 'song') {
            // If it's a favorite song, play the next favorite song
            const favoriteSongs = catalog.filter(m => m.type === 'song' && favorites.includes(m._id));
            const currentIndex = favoriteSongs.findIndex(m => m.mediaUrl === mediaUrl);

            if (currentIndex !== -1 && currentIndex + 1 < favoriteSongs.length) {
                updateMediaUrl(favoriteSongs[currentIndex + 1].mediaUrl);
            }
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
                <Card className="p-8 text-center border-red-500/30 max-w-md w-full">
                    <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
                    <p className="text-slate-300 mb-6">{error}</p>
                    <Button onClick={() => navigate('/')} className="w-full">Return Home</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {inviteToken && (
                <Card className="mb-6 p-6 bg-primary/10 border-primary/30 flex flex-col gap-4 animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-full"><LinkIcon className="w-5 h-5 text-primary" /></div>
                        <div>
                            <h3 className="font-bold text-white">Invite your partner</h3>
                            <p className="text-sm text-slate-300">Copy the link or invite them directly.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <Button onClick={handleCopyLink} variant="secondary" className="w-full sm:w-auto">
                            {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />} {copied ? 'Copied!' : 'Copy Link'}
                        </Button>
                        <div className="hidden sm:block w-px bg-glassBorder mx-2"></div>
                        <form onSubmit={handleSendInvite} className="flex-1 flex gap-2">
                            <Input placeholder="Enter username..." value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} className="flex-1" />
                            <Button type="submit" disabled={!inviteUsername.trim()}><Send className="w-4 h-4 mr-2" /> Send</Button>
                        </form>
                    </div>
                    {inviteStatus && <div className="text-sm text-primary font-medium animate-pulse">{inviteStatus}</div>}
                </Card>
            )}

            {isHost && (
                <Card className="mb-6 p-4 border-glassBorder bg-black/40">
                    <form onSubmit={handleLoadManualVideo} className="flex items-end gap-4">
                        <div className="flex-1">
                            <Input label="Manual URL (YouTube)" placeholder="Or pick from the catalog below..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                        </div>
                        <Button type="submit" disabled={!urlInput.trim()}><Search className="w-4 h-4 mr-2" /> Load</Button>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                <div className="lg:col-span-3 space-y-6">
                    <MediaPlayer
                        url={mediaUrl}
                        roomId={id}
                        initialMediaState={roomData?.currentMedia}
                        onEnded={handleMediaEnded} // <--- NEW: Playlist autoplay logic
                    />
                </div>

                <div className="space-y-6 flex flex-col">
                    <div className="shrink-0"><UsersList roomData={roomData} activeUserIds={activeUserIds} /></div>
                    <div className="flex-1 min-h-[400px]"><Chat roomId={id} /></div>
                </div>
            </div>

            {/* NEW: Room Internal Catalog for Host */}
            {catalog.length > 0 && (
                <div className="border-t border-glassBorder pt-8 mt-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Library className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Room Media Library</h2>
                        {!isHost && <span className="ml-4 text-sm text-slate-400 border border-slate-600 px-2 py-1 rounded-full">Only host can change media</span>}
                    </div>

                    <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-6 px-2">
                        {catalog.map(media => (
                            <div key={media._id} className={!isHost ? "opacity-60 pointer-events-none grayscale transition-all" : ""}>
                                <MediaCard
                                    media={media}
                                    onPlay={handleSelectCatalogItem}
                                    isFavorite={favorites.includes(media._id)}
                                    onToggleFavorite={() => { }} // Disabled inside room to keep it simple, manage on home
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}