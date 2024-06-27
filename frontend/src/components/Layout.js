import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
    const [isNavBarOpen, setIsNavBarOpen] = useState(false);

    const toggleNavBar = (state) => {
        setIsNavBarOpen(state);
    };

    return (
        <div className="relative flex flex-col">
            <NavBar isOpen={isNavBarOpen} toggleNavBar={toggleNavBar} />
            <div className="flex-grow">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default Layout;
