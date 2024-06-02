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
        <nav className="bg-blue-500 p-4">
            <ul className="flex space-x-4">
                <li><Link to="/" className="text-white">Home</Link></li>
                {user && user.user && (
                    <>
                        <li><Link to="/transfer-stock" className="text-white">Transfer Stock</Link></li>
                        <li><Link to="/receive-stock" className="text-white">Receive Stock</Link></li>
                        <li><Link to="/invoices" className="text-white">Invoices</Link></li>
                        <li><Link to="/stocks" className="text-white">Stocks</Link></li>
                        <li><Link to="/records" className="text-white">Records</Link></li>
                        <li>
                <Link to="/bill-history" className="text-white">Bill History</Link>
              </li>
                    </>
                )}
                {user ? (
                    <li onClick={onLogout} className="cursor-pointer text-white">Logout</li>
                ) : (
                    <li><Link to="/login" className="text-white">Login</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;
