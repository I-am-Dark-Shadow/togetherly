import { createContext, useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

export const AuthContext = createContext();

export function AuthContextProvider({ children }) {
    const [authUser, setAuthUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await axiosInstance.get('/auth/me');
            setAuthUser(res.data);
        } catch (error) {
            console.log('User is not authenticated');
            setAuthUser(null);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const res = await axiosInstance.post('/auth/login', credentials);
        setAuthUser(res.data);
    };

    const register = async (credentials) => {
        const res = await axiosInstance.post('/auth/register', credentials);
        setAuthUser(res.data);
    };

    const logout = async () => {
        await axiosInstance.post('/auth/logout');
        setAuthUser(null);
    };

    return (
        <AuthContext.Provider value={{ authUser, isCheckingAuth, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}