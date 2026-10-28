import { Play, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { axiosInstance } from '../../lib/axios';

export function MediaCard({ media, onPlay, isFavorite, onToggleFavorite }) {
    // const getFullUrl = (path) => path?.startsWith('/') ? import.meta.env.VITE_API_URL + path : path;

    return (
        <div className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] bg-black/40 border border-glassBorder shrink-0 w-64">
            {/* Thumbnail */}
            <div className="aspect-video w-full overflow-hidden relative">
                <img
                    src={media.thumbnailUrl}
                    alt={media.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={() => onPlay(media)}
                        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white transform scale-50 group-hover:scale-100 transition-all hover:bg-primary/80"
                    >
                        <Play className="w-5 h-5 ml-1" />
                    </button>
                </div>
            </div>

            {/* Details */}
            <div className="p-4 relative">
                <h3 className="text-white font-bold truncate pr-8">{media.title}</h3>
                <p className="text-xs text-slate-400 capitalize mt-1">{media.type}</p>

                {/* Favorite Button (Only for songs) */}
                {media.type === 'song' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(media._id); }}
                        className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <Heart className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-accent text-accent" : "text-slate-400")} />
                    </button>
                )}
            </div>
        </div>
    );
}