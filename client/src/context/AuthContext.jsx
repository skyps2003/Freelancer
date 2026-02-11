import React, { createContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };
        case 'REGISTER_SUCCESS':
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false
            };
        case 'REGISTER_FAIL':
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                error: action.payload
            };
        case 'CLEAR_ERRORS':
            return { ...state, error: null };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User
    const loadUser = async () => {
        if (localStorage.token) {
            api.defaults.headers.common['x-auth-token'] = localStorage.token;
        } else {
            delete api.defaults.headers.common['x-auth-token'];
            dispatch({ type: 'AUTH_ERROR' });
            return;
        }

        try {
            const res = await api.get('/auth/me');
            dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    // Register User
    const register = async formData => {
        try {
            const res = await api.post('/auth/register', formData);
            dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
            if (res.data.token) api.defaults.headers.common['x-auth-token'] = res.data.token;
        } catch (err) {
            dispatch({ type: 'REGISTER_FAIL', payload: err.response?.data?.msg || 'Error' });
        }
    };

    // Login User
    const login = async formData => {
        try {
            const res = await api.post('/auth/login', formData);
            dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
            if (res.data.token) api.defaults.headers.common['x-auth-token'] = res.data.token;
        } catch (err) {
            dispatch({ type: 'LOGIN_FAIL', payload: err.response?.data?.msg || 'Error' });
        }
    };

    // Update User
    const updateUser = async (userData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': userData instanceof FormData ? 'multipart/form-data' : 'application/json'
                }
            };
            const res = await api.put('/users/profile', userData, config);
            dispatch({ type: 'USER_LOADED', payload: res.data });
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Error actualizando perfil' };
        }
    };

    // Logout
    const logout = () => dispatch({ type: 'LOGOUT' });

    // Clear Errors
    const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                error: state.error,
                register,
                login,
                updateUser,
                logout,
                clearErrors
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
