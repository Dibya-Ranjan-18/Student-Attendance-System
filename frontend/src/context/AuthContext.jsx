import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    const savedUser = JSON.parse(localStorage.getItem('user'));
                    setUser(savedUser);
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('login/', { username, password });
            const { access, user: userData, role, profile } = response.data;
            localStorage.setItem('token', access);
            const fullUser = { ...userData, role, profile };
            localStorage.setItem('user', JSON.stringify(fullUser));
            setUser(fullUser);
            
            if (role === 'admin') navigate('/admin');
            else navigate('/student');
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const googleLogin = async (token) => {
        try {
            const response = await api.post('google-login/', { token });
            const { access, user: userData, role, profile } = response.data;
            localStorage.setItem('token', access);
            const fullUser = { ...userData, role, profile };
            localStorage.setItem('user', JSON.stringify(fullUser));
            setUser(fullUser);
            
            if (role === 'admin') navigate('/admin');
            else navigate('/student');
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Google Login failed',
                email: error.response?.data?.email,
                name: error.response?.data?.name
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        addNotification("Signed out successfully", "info");
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
