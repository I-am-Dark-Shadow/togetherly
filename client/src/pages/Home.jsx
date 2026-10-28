import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MediaCard } from '../components/media/MediaCard';
import { Button } from '../components/ui/Button';
import { axiosInstance } from '../lib/axios';
import { Plus, MonitorPlay, Film, Music, Loader2 } from 'lucide-react';

export default function Home() {
    const { authUser } = useAuth();
    const navigate = useNavigate();
    const [mediaList, setMediaList] = useState([]);
    const [favorites, setFavorites] = useState(authUser?.favorites || []);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await axiosInstance.get('/media');
                setMediaList(res.data);
            } catch (err) {
                console.error("Failed to fetch media catalog");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMedia();
    }, []);

    const handleToggleFavorite = async (mediaId) => {
        try {
            const res = await axiosInstance.post('/media/favorite', { mediaId });
            setFavorites(res.data.favorites);
        } catch (error) {
            console.error("Failed to toggle favorite");
        }
    };

    const handleCreateEmptyRoom = async () => {
        setIsCreating(true);
        try {
            const res = await axiosInstance.post('/rooms');
            navigate(`/room/${res.data.roomId}?invite=${res.data.token}`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handlePlayMedia = async (media) => {
        // Creates a room and passes the selected media URL in the query string
        setIsCreating(true);
        try {
            const res = await axiosInstance.post('/rooms');
            // The Room component will read '?play=' and auto-start this video
            navigate(`/room/${res.data.roomId}?invite=${res.data.token}&play=${encodeURIComponent(media.mediaUrl)}`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const videos = mediaList.filter(m => m.type === 'video');
    const songs = mediaList.filter(m => m.type === 'song');
    const favoriteSongs = songs.filter(s => favorites.includes(s._id));

    if (isLoading || isCreating) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 pb-20">

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-black/40 border border-glassBorder p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10" />
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Welcome back, <span className="text-primary">{authUser.username}</span>
                    </h1>
                    <p className="text-slate-400">Select a movie to watch solo, or share the room link to watch together.</p>
                </div>
                <Button size="lg" onClick={handleCreateEmptyRoom} className="shrink-0">
                    <Plus className="w-5 h-5 mr-2" /> Create Empty Room
                </Button>
            </div>

            {/* Movies / Videos Row */}
            {videos.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Film className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Trending Movies</h2>
                    </div>
                    <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-6 px-2">
                        {videos.map(video => (
                            <MediaCard key={video._id} media={video} onPlay={handlePlayMedia} />
                        ))}
                    </div>
                </section>
            )}

            {/* Favorite Music Playlist */}
            {favoriteSongs.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Heart className="w-6 h-6 text-accent fill-accent" />
                        <h2 className="text-2xl font-bold">Your Music Playlist</h2>
                    </div>
                    <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-6 px-2">
                        {favoriteSongs.map(song => (
                            <MediaCard
                                key={song._id}
                                media={song}
                                onPlay={handlePlayMedia}
                                isFavorite={true}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* All Music Row */}
            {songs.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Music className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">All Songs</h2>
                    </div>
                    <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-6 px-2">
                        {songs.map(song => (
                            <MediaCard
                                key={song._id}
                                media={song}
                                onPlay={handlePlayMedia}
                                isFavorite={favorites.includes(song._id)}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}