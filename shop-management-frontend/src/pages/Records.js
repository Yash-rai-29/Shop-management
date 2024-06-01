import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Records = () => {
    const [isAdding, setIsAdding] = useState(true);
    const [recordName, setRecordName] = useState('');
    const [shopName, setShopName] = useState('');
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState('');
    const [records, setRecords] = useState([]);
    const [filterMonth, setFilterMonth] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchRecords();
    }, [filterMonth, sortOrder]);

    useEffect(() => {
        const currentMonth = new Date().toISOString().substr(0, 7);
        setMonth(currentMonth);
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/records`, {
                params: { month: filterMonth, sortOrder }
            });
            setRecords(response.data);
        } catch (error) {
            console.error('There was an error fetching the records!', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/records`, {
                recordName,
                shopName,
                message,
                amount,
                month
            });
            console.log(response.data);
            alert('Record added successfully');
            fetchRecords();
            setRecordName('');
            setShopName('');
            setMessage('');
            setAmount('');
            setMonth('');
        } catch (error) {
            console.error('There was an error adding the record!', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl mb-4">Records</h1>
            <div className="flex justify-center mb-4">
                <button 
                    className={`mr-4 py-2 px-4 rounded ${isAdding ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setIsAdding(true)}
                >
                    Add Record
                </button>
                <button 
                    className={`py-2 px-4 rounded ${!isAdding ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setIsAdding(false)}
                >
                    List Records
                </button>
            </div>

            {isAdding ? (
                <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded shadow">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recordName">
                            Record Name
                        </label>
                        <input
                            type="text"
                            id="recordName"
                            value={recordName}
                            onChange={(e) => setRecordName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shopName">
                            Shop Name
                        </label>
                        <select
                            id="shopName"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="" disabled>Select Shop</option>
                            <option value="vamanpui">Vamanpui</option>
                            <option value="amariya">Amariya</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                            Message
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                            Amount
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="month">
                            Month
                        </label>
                        <input
                            type="month"
                            id="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Submit
                    </button>
                </form>
            ) : (
                <div className="max-w-lg mx-auto bg-white p-8 rounded shadow">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filterMonth">
                            Filter by Month
                        </label>
                        <input
                            type="month"
                            id="filterMonth"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sortOrder">
                            Sort by Amount
                        </label>
                        <select
                            id="sortOrder"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                    <div>
                        {records.map(record => (
                            <div key={record._id} className="mb-4 p-4 border rounded shadow">
                                <h2 className="text-xl font-bold">{record.recordName}</h2>
                                <p>Shop: {record.shopName}</p>
                                <p>Message: {record.message}</p>
                                <p>Amount: ${record.amount}</p>
                                <p>Date: {new Date(record.date).toLocaleDateString()}</p>
                                <p>Month: {record.month}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Records;
