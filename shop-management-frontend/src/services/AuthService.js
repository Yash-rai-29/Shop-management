import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://shop-management-im3g.onrender.com/api/auth';

const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

const removeAuthToken = () => {
    delete axios.defaults.headers.common['x-auth-token'];
};

const register = async (user) => {
    try {
        const res = await axios.post(`${API_URL}/register`, user);
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data || 'Network error' };
    }
};

const login = async (user) => {
    try {
        const res = await axios.post(`${API_URL}/login`, user);
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data || 'Network error' };
    }
};

const setupInterceptors = (logout) => {
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response.status === 401) {
                logout();
            }
            return Promise.reject(error);
        }
    );
};

export { register, login, setAuthToken, removeAuthToken, setupInterceptors };
