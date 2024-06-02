import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Invoices from "./pages/Invoices";
import Stocks from "./pages/Stocks";
import TransferStock from "./pages/TransferStock";
import ReceiveStock from "./pages/ReceiveStock";
import Records from "./pages/Records";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import BillHistory from "./pages/BillHistory";

const PrivateRoute = ({ element: Component }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

const App = () => {
    return (
        <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="/invoices" element={<PrivateRoute element={Invoices} />} />
                        <Route path="/stocks" element={<PrivateRoute element={Stocks} />} />
                        <Route path="/transfer-stock" element={<PrivateRoute element={TransferStock} />} />
                        <Route path="/receive-stock" element={<PrivateRoute element={ReceiveStock} />} />
                        <Route path="/records" element={<PrivateRoute element={Records} />} />
                        <Route path="/bill-history" element={<PrivateRoute element={BillHistory} />} />
                    </Route>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
        </AuthProvider>
    );
};

export default App;
