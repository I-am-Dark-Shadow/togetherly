import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext();

// Create the socket instance outside the component to prevent recreation on re-renders.
// autoConnect: false prevents it from connecting before we have a verified user.
const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    autoConnect: false,
});

export function SocketContextProvider({ children }) {
    const { authUser, isCheckingAuth } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only connect if auth check is done AND user is logged in
        if (!isCheckingAuth && authUser) {
            socket.connect();

            const onConnect = () => setIsConnected(true);
            const onDisconnect = () => setIsConnected(false);

            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);

            // Cleanup on unmount or when authUser changes (like logging out)
            return () => {
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
                socket.disconnect();
            };
        }
    }, [authUser, isCheckingAuth]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}