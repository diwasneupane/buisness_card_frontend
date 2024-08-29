import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser, refreshAccessToken } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const initAuth = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Failed to get current user:', error);
            try {
                await refreshAccessToken();
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const login = async (email, password) => {
        try {
            const { user: loggedInUser } = await loginUser(email, password);
            setUser(loggedInUser);
            return loggedInUser;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    const register = async (username, email, password) => {
        try {
            const { user: newUser } = await registerUser(username, email, password);
            setUser(newUser);
            return newUser;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const value = {
        user,
        login,
        logout,
        register,
        loading,
        isAdmin: user?.isAdmin || false
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};