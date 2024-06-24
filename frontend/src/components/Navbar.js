import React, { useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const NavBar = ({ isOpen, toggleNavBar }) => {
    const { user, handleLogout } = useContext(AuthContext);
    const navigate = useNavigate();
    const navRef = useRef();

    const onLogout = () => {
        handleLogout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                toggleNavBar(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, toggleNavBar]);

    return (
        <>
            <button 
                onMouseEnter={() => toggleNavBar(true)} 
                onClick={() => toggleNavBar(!isOpen)} 
                className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-md focus:outline-none"
            >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <nav 
                ref={navRef}
                className={`fixed top-0 left-0 h-full bg-blue-600 p-4 shadow-md transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40`}
                style={{ width: '250px' }}
            >
                <div className="flex flex-col h-100vh justify-between mt-14">
                    <ul className="space-y-4">
                        <li>
                            <Link to="/" className="text-white hover:text-gray-200 text-xl p-4" onClick={() => toggleNavBar(false)}>Home</Link>
                        </li>
                        {user && user.user && (
                            <>
                                <li>
                                    <Link to="/transfer-stock" className="text-white  text-xl p-4 hover:text-gray-200" onClick={() => toggleNavBar(false)}>Transfer Stock</Link>
                                </li>
                                <li>
                                    <Link to="/receive-stock" className="text-white  text-xl p-4 hover:text-gray-200" onClick={() => toggleNavBar(false)}>Receive Stock</Link>
                                </li>
                              
                                <li>
                                    <Link to="/stocks" className="text-white  text-xl p-4 hover:text-gray-200" onClick={() => toggleNavBar(false)}>Stocks</Link>
                                </li>
                                <li>
                                    <Link to="/records" className="text-white  text-xl p-4 hover:text-gray-200" onClick={() => toggleNavBar(false)}>Records</Link>
                                </li>
                                <li>
                                    <Link to="/bill-history" className="text-white  text-xl p-4 hover:text-gray-200" onClick={() => toggleNavBar(false)}>Bill History</Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <ul className="space-y-4">
                        {user ? (
                            <li onClick={() => { onLogout(); toggleNavBar(false); }} className="cursor-pointer mt-96  text-xl p-4 text-white hover:text-gray-200">
                                Logout
                            </li>
                        ) : (
                            <li>
                                <Link to="/login" className="text-white hover:text-gray-200" onClick={() => toggleNavBar(false)}>Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default NavBar;
