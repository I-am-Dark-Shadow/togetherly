import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { axiosInstance } from '../lib/axios';

export function useRoomSync(roomId) {
    const { socket, isConnected } = useSocket();
    const [roomData, setRoomData] = useState(null);
    const [activeUserIds, setActiveUserIds] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Media State
    const [mediaUrl, setMediaUrl] = useState('');

    const fetchRoomRest = async () => {
        try {
            const res = await axiosInstance.get(`/rooms/${roomId}`);
            setRoomData(res.data);
        } catch (err) {
            console.error('Failed to refetch room', err);
        }
    };

    useEffect(() => {
        if (!isConnected || !roomId) return;

        setIsLoading(true);
        setError('');

        socket.emit('join-room-stream', { roomId }, (response) => {
            if (response?.error) {
                setError(response.error);
                setIsLoading(false);
            } else if (response?.success) {
                setRoomData(response.room);
                setActiveUserIds(response.activeUserIds);
                setMediaUrl(response.room.currentMedia?.url || ''); // Set initial URL
                setIsLoading(false);
            }
        });

        const handleUserJoined = ({ userId }) => {
            setActiveUserIds((prev) => !prev.includes(userId) ? [...prev, userId] : prev);
            fetchRoomRest();
        };

        const handleUserLeft = ({ userId }) => {
            setActiveUserIds((prev) => prev.filter(id => id !== userId));
        };

        const handleMediaUrlChanged = ({ url }) => {
            setMediaUrl(url);
        };

        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);
        socket.on('media-url-changed', handleMediaUrlChanged); // Listen for URL changes

        return () => {
            socket.emit('leave-room-stream', { roomId });
            socket.off('user-joined', handleUserJoined);
            socket.off('user-left', handleUserLeft);
            socket.off('media-url-changed', handleMediaUrlChanged);
        };
    }, [roomId, isConnected, socket]);

    // Function for the Host to update the URL
    const updateMediaUrl = (url) => {
        socket.emit('set-media-url', { roomId, url }, (res) => {
            if (res.error) console.error(res.error);
            // We don't manually setMediaUrl here because the server will broadcast 
            // 'media-url-changed' back to us, keeping everyone in perfect sync.
        });
    };

    return { roomData, activeUserIds, error, isLoading, mediaUrl, updateMediaUrl };
}