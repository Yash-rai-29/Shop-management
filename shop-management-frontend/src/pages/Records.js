import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSortUp, FaSortDown } from 'react-icons/fa';

const Records = () => {
    const [isAdding, setIsAdding] = useState(true);
    const [recordName, setRecordName] = useState('Purchase Stock');
    const [shopName, setShopName] = useState('');
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('By Cash');
    const [records, setRecords] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchRecords();
    }, [filterDate, sortField, sortOrder]);

    useEffect(() => {
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        setDate(currentDate);
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/records`, {
                params: { date: filterDate, sortField, sortOrder }
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
                date,
                paymentMethod
            });
            console.log(response);
            alert('Record added successfully');
           
            fetchRecords();
            setRecordName('Purchase Stock');
            setShopName('');
            setMessage('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setPaymentMethod('');
        } catch (error) {
            console.error('There was an error adding the record!', error);
        }
    };

    // Function to format date from ISO format to DD/MM/YY
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are zero indexed
        const year = date.getFullYear().toString().slice(-2); // Get last two digits of year
        return `${day}/${month}/${year}`;
    };

    // Function to handle sorting
    const handleSort = (field) => {
        if (field === sortField) {
            const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            setSortOrder(newSortOrder);
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Function to filter records by shop name
    const filterRecordsByShop = (record) => {
        if (!shopName) return true; // Return true if no shop name is selected (no filtering)
        return record.shopName.toLowerCase() === shopName.toLowerCase();
    };

    return (
        <div className="mx-auto p-4 bg-blue-300">
            <h1 className="text-3xl font-bold mb-4 text-center">Records</h1>
            <div className="flex justify-center mb-6">
                <button
                    className={`mr-4 py-2 px-6 rounded-lg ${isAdding ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} transition duration-300 ease-in-out`}
                    onClick={() => setIsAdding(true)}
                >
                    Add Record
                </button>
                <button
                    className={`py-2 px-6 rounded-lg ${!isAdding ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} transition duration-300 ease-in-out`}
                    onClick={() => setIsAdding(false)}
                >
                    List Records
                </button>
            </div>

            {isAdding ? (
                <form
                    onSubmit={handleSubmit}
                    className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg"
                >
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="recordName"
                        >
                            Record Name
                        </label>
                        <select
                            id="recordName"
                            value={recordName}
                            onChange={(e) => setRecordName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="Receive Payment">Bank Deposit</option>
                            <option value="Purchase Stock">Purchase Stock</option>
                            <option value="Excise Inspector Payment">
                                Excise Inspector Payment
                            </option>
                            <option value="Directly Purchase Stock">
                                Directly Purchase Stock
                            </option>
                            <option value="Salary">Salary</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="shopName"
                        >
                            Shop Name
                        </label>
                        <select
                            id="shopName"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="">Select Shop</option>
                            <option value="vamanpui">Vamanpui</option>
                            <option value="amariya">Amariya</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="message"
                        >
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
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="amount"
                        >
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
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="date"
                        >
                            Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="paymentMethod"
                        >
                            Payment Method
                        </label>
                        <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="By Cash">By Cash</option>
                            <option value="By Bank">By Bank</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                    >
                        Submit
                    </button>
                </form>
            ) : (
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg overflow-x-auto">
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="filterDate"
                        >
                            Filter by Date
                        </label>
                        <input
                            type="date"
                            id="filterDate"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="sortOrder"
                        >
                            Sort by Date
                            {sortOrder === 'asc' ? (
                                <FaSortUp
                                    className="ml-1 cursor-pointer inline-block"
                                    onClick={() => handleSort('date')}
                                />
                            ) : (
                                <FaSortDown
                                    className="ml-1 cursor-pointer inline-block"
                                    onClick={() => handleSort('date')}
                                />
                            )}
                        </label>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                        <thead>
                            <tr>
                                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">
                                    Record Name
                                </th>
                                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">
                                    Shop Name
                                </th>
                                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">
                                    Message
                                </th>
                                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">
                                    Amount
                                </th>
                                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">
                                    Date
                                </th>
                                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">
                                    Payment Method
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {records
                                .filter(filterRecordsByShop)
                                .sort((a, b) => {
                                    if (sortOrder === 'asc') {
                                        return new Date(a.date) - new Date(b.date);
                                    } else {
                                        return new Date(b.date) - new Date(a.date);
                                    }
                                })
                                .map((record) => (
                                    <tr key={record.id}>
                                        <td className="py-3 px-6 border-b border-gray-200">
                                            {record.recordName}
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-200">
                                            {record.shopName}
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-200">
                                            {record.message}
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-200">
                                            {record.amount}
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-200">
                                            {formatDate(record.date)}
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-200">
                                            {record.paymentMethod}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Records;
