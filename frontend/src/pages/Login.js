import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const { handleLogin } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await handleLogin({ email, password });
            toast.success("Login successful!", {
                position: "top-right",
                autoClose: 5000,
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials and try again.";
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <ToastContainer />
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                {/* <div className="mt-4 text-center">
                    <p className="text-sm">Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link></p>
                </div> */}
            </div>
        </div>
    );
};

export default Login;
