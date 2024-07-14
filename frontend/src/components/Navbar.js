import React, { useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import classNames from 'classnames';

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
                onClick={() => toggleNavBar(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-md focus:outline-none hover:bg-blue-700 transition-colors duration-300"
            >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <nav
                ref={navRef}
                className={classNames(
                    'fixed top-0 left-0 h-full bg-blue-600 p-4 shadow-md transform transition-transform duration-300 ease-in-out z-40',
                    { 'translate-x-0': isOpen, '-translate-x-full': !isOpen }
                )}
                style={{ width: '250px' }}
            >
                <div className="flex flex-col h-full justify-between mt-10">
                    <ul className="space-y-4">
                        <NavItem to="/" text="Home" onClick={() => toggleNavBar(false)} />
                        {user && user.user && (
                            <>
                                <NavItem to="/transfer-stock" text="Transfer Stock" onClick={() => toggleNavBar(false)} />
                                <NavItem to="/receive-stock" text="Receive Stock" onClick={() => toggleNavBar(false)} />
                                <NavItem to="/stocks" text="Stocks" onClick={() => toggleNavBar(false)} />
                                <NavItem to="/records" text="Records" onClick={() => toggleNavBar(false)} />
                                <NavItem to="/bill-history" text="Bill History" onClick={() => toggleNavBar(false)} />
                            </>
                        )}
                    </ul>
                    <ul className="space-y-4 mb-10">
                        {user ? (
                            <li className="cursor-pointer text-xl p-4 text-white hover:text-gray-200 transition-colors duration-300" onClick={() => { onLogout(); toggleNavBar(false); }}>
                                Logout
                            </li>
                        ) : (
                            <NavItem to="/login" text="Login" onClick={() => toggleNavBar(false)} />
                        )}
                    </ul>
                </div>
            </nav>
        </>
    );
};

const NavItem = ({ to, text, onClick }) => (
    <li>
        <Link to={to} className="text-white text-xl p-4 hover:text-gray-200 transition-colors duration-300" onClick={onClick}>
            {text}
        </Link>
    </li>
);

export default NavBar;
