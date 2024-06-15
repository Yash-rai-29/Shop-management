import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./Navbar";

const Layout = () => {
    const [isNavBarOpen, setIsNavBarOpen] = useState(false);

    const toggleNavBar = () => {
        setIsNavBarOpen(!isNavBarOpen);
    };

    return (
        <div className="flex h-full">
            <NavBar isOpen={isNavBarOpen} toggleNavBar={toggleNavBar} />
            <div
                className={`transition-all duration-300 ease-in-out flex-grow ${isNavBarOpen ? 'ml-64' : 'ml-0'}`}
            >
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
