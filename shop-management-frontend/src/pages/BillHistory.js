import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";

const BillHistory = () => {
  const [billHistory, setBillHistory] = useState([]);
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading: userLoading } = useContext(AuthContext);

  useEffect(() => {
    // Set the default value of the month to the current month
    const currentMonth = new Date().toISOString().substring(0, 7);
    setMonth(currentMonth);
  }, []);

  useEffect(() => {
    const fetchBillHistory = async () => {
      if (userLoading) return;

      setLoading(true);
      try {
        if (!user || !user.token) {
          throw new Error('User not authenticated');
        }

        const res = await axios.get(`${process.env.REACT_APP_API_URL}/billHistory`, {
          params: { month },
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBillHistory(res.data);
        setError('');
      } catch (error) {
        setError('Error fetching bill history');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillHistory();
  }, [user, userLoading, month]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-900">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl mb-6 text-center font-semibold">Bill History</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
          <label htmlFor="month" className="block mb-1 text-lg font-medium text-gray-700">Filter by Month</label>
          <input
            type="month"
            id="month"
            value={month}
            onChange={handleMonthChange}
            className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border-collapse shadow-md">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-2 px-4 border">Date</th>
                  <th className="py-2 px-4 border">Total Sales</th>
                  <th className="py-2 px-4 border">UPI Payment</th>
                  <th className="py-2 px-4 border">Discount</th>
                  <th className="py-2 px-4 border">Desi Sales</th>
                  <th className="py-2 px-4 border">Beer Sales</th>
                  <th className="py-2 px-4 border">Shop</th>
                </tr>
              </thead>
              <tbody>
                {billHistory.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border">{new Date(bill.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border">₹{bill.totalSales.toFixed(2)}</td>
                    <td className="py-2 px-4 border">₹{bill.upiPayment.toFixed(2)}</td>
                    <td className="py-2 px-4 border">₹{bill.discount.toFixed(2)}</td>
                    <td className="py-2 px-4 border">₹{bill.desiSales.toFixed(2)}</td>
                    <td className="py-2 px-4 border">₹{bill.beerSales.toFixed(2)}</td>
                    <td className="py-2 px-4 border">{bill.shop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillHistory;