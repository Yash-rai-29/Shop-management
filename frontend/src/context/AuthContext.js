import React, { createContext, useReducer, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login, setAuthToken, removeAuthToken, setupInterceptors } from '../services/AuthService';

const AuthContext = createContext();

const authReducer = (state, { type, payload }) => {
    switch (type) {
        case 'LOGIN':
            return { ...state, user: payload, isAuthenticated: true };
        case 'LOGOUT':
            return { ...state, user: null, isAuthenticated: false };
        default:
            return state;
    }
};

const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null, isAuthenticated: false });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')) || null;
        if (user) {
            setAuthToken(user.token);
            dispatch({ type: 'LOGIN', payload: user });
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        setupInterceptors(() => {
            handleLogout();
        });
    }, []);

    const handleLogin = async (userData) => {
        try {
            const response = await login(userData);
            if (response.success) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setAuthToken(response.data.token);
                dispatch({ type: 'LOGIN', payload: response.data });
                navigate('/');
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const handleRegister = async (userData) => {
        try {
            const response = await register(userData);
            if (response.success) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setAuthToken(response.data.token);
                dispatch({ type: 'LOGIN', payload: response.data });
                navigate('/');
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        removeAuthToken();
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ ...state, handleLogin, handleRegister, handleLogout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };