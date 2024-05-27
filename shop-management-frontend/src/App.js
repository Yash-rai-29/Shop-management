import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Invoices from "./pages/Invoices";
import Stocks from "./pages/Stocks";
import NavBar from "./components/Navbar";
import TransferStock from "./pages/TransferStock";
import ReceiveStock from "./pages/ReceiveStock";

const App = () => {
  return (
    <div>
      <NavBar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/transfer-stock" element={<TransferStock/>} />
          <Route path="/receive-stock" element={<ReceiveStock />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
