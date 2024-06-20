import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./Navbar";

const Layout = () => {
    const [isNavBarOpen, setIsNavBarOpen] = useState(false);

    const toggleNavBar = (state) => {
        setIsNavBarOpen(state);
    };

    return (
        <div className="relative flex">
            <NavBar isOpen={isNavBarOpen} toggleNavBar={toggleNavBar} />
            <div className="flex-grow">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
