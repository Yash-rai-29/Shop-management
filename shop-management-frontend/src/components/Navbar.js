import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const NavBar = ({ isOpen, toggleNavBar }) => {
    const { user, handleLogout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        handleLogout();
        navigate('/login');
    };

    return (
        <>
            <button 
                onClick={toggleNavBar} 
                className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-md focus:outline-none"
            >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <nav 
                className={`fixed top-0 left-0 h-full bg-blue-600 p-4 shadow-md transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40`}
                style={{ width: '250px' }}
            >
                <div className="flex flex-col h-100vh justify-between mt-14">
                    <ul className="space-y-4">
                        <li>
                            <Link to="/" className="text-white hover:text-gray-200" onClick={toggleNavBar}>Home</Link>
                        </li>
                        {user && user.user && (
                            <>
                                <li>
                                    <Link to="/transfer-stock" className="text-white hover:text-gray-200" onClick={toggleNavBar}>Transfer Stock</Link>
                                </li>
                                <li>
                                    <Link to="/receive-stock" className="text-white hover:text-gray-200" onClick={toggleNavBar}>Receive Stock</Link>
                                </li>
                                <li>
                                    <Link to="/invoices" className="text-white hover:text-gray-200" onClick={toggleNavBar}>Invoices</Link>
                                </li>
                                <li>
                                    <Link to="/stocks" className="text-white hover:text-gray-200" onClick={toggleNavBar}>Stocks</Link>
                                </li>
                                <li>
                                    <Link to="/records" className="text-white hover:text-gray-200" onClick={toggleNavBar}>Records</Link>
                                </li>
                                <li>
                                    <Link to="/bill-history" className="text-white hover:text-gray-200" onClick={toggleNavBar}>Bill History</Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <ul className="space-y-4">
                        {user ? (
                            <li onClick={() => { onLogout(); toggleNavBar(); }} className="cursor-pointer text-white hover:text-gray-200 mt-80">
                                Logout
                            </li>
                        ) : (
                            <li>
                                <Link to="/login" className="text-white hover:text-gray-200" onClick={toggleNavBar}>Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default NavBar;
