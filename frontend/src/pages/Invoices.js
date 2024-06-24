import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";

const Invoices = () => {
  const { user, loading } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [error, setError] = useState("");

  // Function to get the current month in 'YYYY-MM' format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      if (loading) {
        return;
      }

      if (!user || !user.token) {
        setError("User not authenticated");
        return;
      }

      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/invoices`);
        setInvoices(res.data);
        setSelectedMonth(getCurrentMonth());
        setFilteredInvoices(res.data.filter(invoice => {
          const invoiceDate = new Date(invoice.createdAt);
          const invoiceMonth = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;
          return invoiceMonth === getCurrentMonth();
        }));
      } catch (error) {
        setError("Error fetching invoices");
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, [user, loading]);

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);

    if (month === "") {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        const invoiceMonth = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;
        return invoiceMonth === month;
      });
      setFilteredInvoices(filtered);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4  bg-blue-300 mx-auto">
      <h2 className="text-3xl mb-6 font-bold text-center">Invoices</h2>
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      <div className="mb-4 flex justify-center">
        <label htmlFor="monthFilter" className="mr-2 text-lg">Filter by Month:</label>
        <input
          type="month"
          id="monthFilter"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="border p-2 rounded-md"
        />
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice, index) => (
              <li key={invoice._id} className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Invoice {index + 1} - {new Date(invoice.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-5 sm:px-6 text-center text-gray-500">No invoices found</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Invoices;
