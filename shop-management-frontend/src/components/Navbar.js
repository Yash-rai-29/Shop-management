import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavBar = () => {
    const { user, handleLogout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        handleLogout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <ul className="flex space-x-4">
                    <li>
                        <Link to="/" className="text-white hover:text-gray-200">Home</Link>
                    </li>
                    {user && user.user && (
                        <>
                            <li>
                                <Link to="/transfer-stock" className="text-white hover:text-gray-200">Transfer Stock</Link>
                            </li>
                            <li>
                                <Link to="/receive-stock" className="text-white hover:text-gray-200">Receive Stock</Link>
                            </li>
                            <li>
                                <Link to="/invoices" className="text-white hover:text-gray-200">Invoices</Link>
                            </li>
                            <li>
                                <Link to="/stocks" className="text-white hover:text-gray-200">Stocks</Link>
                            </li>
                            <li>
                                <Link to="/records" className="text-white hover:text-gray-200">Records</Link>
                            </li>
                            <li>
                                <Link to="/bill-history" className="text-white hover:text-gray-200">Bill History</Link>
                            </li>
                        </>
                    )}
                </ul>
                <ul className="flex space-x-4">
                    {user ? (
                        <li onClick={onLogout} className="cursor-pointer text-white hover:text-gray-200">
                            Logout
                        </li>
                    ) : (
                        <li>
                            <Link to="/login" className="text-white hover:text-gray-200">Login</Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
