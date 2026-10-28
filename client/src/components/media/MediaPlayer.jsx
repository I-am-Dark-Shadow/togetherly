import { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Film, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { useSocket } from '../../hooks/useSocket';

export function MediaPlayer({ url, roomId, initialMediaState, onEnded }) {

    // const fullUrl = url?.startsWith('/') ? import.meta.env.VITE_API_URL + url : url;
    const { socket } = useSocket();
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [notice, setNotice] = useState('');

    // This lock is the most critical piece of the player. 
    // It prevents programmatic server commands from triggering outgoing client events.
    const isProgrammaticAction = useRef(false);

    // 1. Handle incoming real-time sync commands from the server
    useEffect(() => {
        if (!socket) return;

        const handleSync = ({ state, time, updatedAt, actionBy, action }) => {
            if (!playerRef.current) return;

            // Unobtrusive UI notification
            if (action === 'PLAY') setNotice(`${actionBy} played`);
            if (action === 'PAUSE') setNotice(`${actionBy} paused`);
            if (action === 'SEEK') setNotice(`${actionBy} skipped`);
            setTimeout(() => setNotice(''), 3000);

            // Lock the event emitters
            isProgrammaticAction.current = true;

            // Calculate where the video SHOULD be right now, accounting for network transit time
            let expectedTime = time;
            if (state === 'PLAYING') {
                const latencySecs = (Date.now() - new Date(updatedAt).getTime()) / 1000;
                expectedTime += latencySecs;
            }

            const currentTime = playerRef.current.getCurrentTime();
            const drift = Math.abs(currentTime - expectedTime);

            // If out of sync by more than 1.5s, or it's an explicit seek command, jump the video
            if (drift > 1.5 || action === 'SEEK') {
                playerRef.current.seekTo(expectedTime, 'seconds');
            }

            // Sync play/pause state
            setIsPlaying(state === 'PLAYING');

            // Release the lock safely after ReactPlayer has processed the changes
            setTimeout(() => { isProgrammaticAction.current = false; }, 250);
        };

        socket.on('sync-state', handleSync);
        return () => socket.off('sync-state', handleSync);
    }, [socket]);

    // 2. Transmit local user actions to the server
    const emitAction = (action) => {
        // If this action was caused by the server, DO NOT emit it back (prevents infinite loops)
        if (isProgrammaticAction.current || !socket || !roomId) return;

        const time = playerRef.current?.getCurrentTime() || 0;
        socket.emit('media-action', { roomId, action, time });
    };

    // 3. Catch up if joining late or reconnecting
    const handleReady = () => {
        if (initialMediaState && playerRef.current) {
            isProgrammaticAction.current = true;

            let expectedTime = initialMediaState.time;
            if (initialMediaState.state === 'PLAYING') {
                expectedTime += (Date.now() - new Date(initialMediaState.updatedAt).getTime()) / 1000;
            }

            if (expectedTime > 1) {
                playerRef.current.seekTo(expectedTime, 'seconds');
            }
            setIsPlaying(initialMediaState.state === 'PLAYING');

            setTimeout(() => { isProgrammaticAction.current = false; }, 250);
        }
    };

    if (!url) {
        return (
            <Card className="w-full aspect-video flex flex-col items-center justify-center bg-black/60 border-glassBorder shadow-2xl">
                <Film className="w-12 h-12 text-slate-600 mb-4" />
                <span className="text-slate-400 font-medium tracking-widest uppercase">Waiting for host to select a video</span>
            </Card>
        );
    }

    return (
        <Card className="w-full relative pt-[56.25%] overflow-hidden bg-black shadow-2xl border-glassBorder group">
            {notice && (
                <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <Info className="w-3 h-3 text-primary" />
                    {notice}
                </div>
            )}
            <ReactPlayer
                ref={playerRef}
                className="absolute top-0 left-0"
                url={url}
                width="100%"
                height="100%"
                controls={true}
                playing={isPlaying}
                onReady={handleReady}
                onEnded={onEnded}
                onPlay={() => {
                    if (!isProgrammaticAction.current) {
                        setIsPlaying(true);
                        emitAction('PLAY');
                    }
                }}
                onPause={() => {
                    if (!isProgrammaticAction.current) {
                        setIsPlaying(false);
                        emitAction('PAUSE');
                    }
                }}
                onSeek={() => emitAction('SEEK')}
                onBuffer={() => emitAction('BUFFERING')}
                onBufferEnd={() => emitAction('PLAY')}
            />
        </Card>
    );
}