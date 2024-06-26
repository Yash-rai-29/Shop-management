import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import Modal from 'react-modal';

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
    const [showModal, setShowModal] = useState(false);
    const [importedData, setImportedData] = useState([]);
    const [showProcessingModal, setShowProcessingModal] = useState(false);

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

    const InputShopName = () => {
        return (
            <>

                <option value="">Select Shop</option>
                <option value="vamanpui">Vamanpui</option>
                <option value="amariya">Amariya</option>

            </>
        )
    };

    const InputRecord = () => {
        return (
            <>

<option value="">Select Record Name</option>
                <option value="Purchase Stock">Purchase Stock</option>
                <option value="Receive Payment">Bank Deposit</option>
                <option value="Excise Inspector Payment">Excise Inspector Payment</option>
                <option value="Directly Purchase Stock">Directly Purchase Stock</option>
                <option value="MMGD">MMGD</option>
                <option value="assessment">Assessment</option>
                <option value="Salary">Salary</option>
                <option value="Cash Handling Charges">Cash Handling Charges</option>
                <option value="Receive Payment By Bank">Bank Deposit Through Second Bank</option>

            </>
        )
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

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSort = (field) => {
        if (field === sortField) {
            const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            setSortOrder(newSortOrder);
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const filterRecordsByShop = (record) => {
        if (!shopName) return true;
        return record.shopName.toLowerCase() === shopName.toLowerCase();
    };

    const handleRecordNameChange = (index, value) => {
        const updatedData = [...importedData];
        updatedData[index].recordName = value;
        setImportedData(updatedData);
    };

    const handleShopNameChange = (index, value) => {
        const updatedData = [...importedData];
        updatedData[index].shopName = value;
        setImportedData(updatedData);
    };

    const handleMessageChange = (index, value) => {
        const updatedData = [...importedData];
        updatedData[index].message = value;
        setImportedData(updatedData);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                processData(data);
            };
            reader.readAsBinaryString(file);
        }
    };

    const processData = (data) => {
        const excelDateToJSDate = (serial) => {
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
            return jsDate;
        };

        const formatJSDate = (date) => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const processedData = data.slice(1).map(row => {
            const date = excelDateToJSDate(row[0]);
            const debitedAmount = row[4] !== undefined ? parseFloat(row[4]) : 0;
            return {
                date: formatJSDate(date),
                description: row[2],
                debitedAmount
            };
        }).filter(row => row.date && row.description && row.debitedAmount > 0);

        setImportedData(processedData);
        setShowModal(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setShowProcessingModal(true); // Show the processing modal

        for (const record of importedData) {
            const parts = record.date.split('/');
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

            const newRecord = {
                recordName: record.recordName,
                shopName: record.shopName,
                message: record.message || 'No message provided',
                amount: record.debitedAmount, // Convert amount to string
                date: new Date(formattedDate).toISOString().split('T')[0],
                paymentMethod: 'By Bank'
            };

            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/records`, newRecord);
                console.log(response);
            } catch (error) {
                console.error('There was an error adding the record!', error);
            }
        }

        alert('All records added successfully');
        setShowModal(false);
        setShowProcessingModal(false); // Hide the processing modal
        fetchRecords();
    };


    return (
        <div className="mx-auto p-4 bg-blue-300">
            <h1 className="text-3xl font-bold mb-4 text-center">Records</h1>
            <div className="flex justify-center mb-6">
                <button
                    className={`mr-4 py-2 px-6 rounded-lg ${isAdding ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} transition duration-300 ease-in-out`}
                    onClick={() => setIsAdding(true)}
                >
                    Add Record
                </button>
                <button
                    className={`mr-4 py-2 px-6 rounded-lg ${!isAdding ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} transition duration-300 ease-in-out`}
                    onClick={() => setIsAdding(false)}
                >
                    List Records
                </button>
                <button
                    className={`py-2 px-6 rounded-lg bg-white text-gray-700 transition duration-300 ease-in-out cursor-pointer`}
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    Import File
                </button>
                <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                />
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
                            <InputRecord />
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
                            <InputShopName />
                        </select>
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="message"
                        >
                            Message
                        </label>
                        <input
                            type="text"
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
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Add Record
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="flex justify-center mb-4">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b" onClick={() => handleSort('date')}>
                                        Date {sortField === 'date' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </th>
                                    <th className="py-2 px-4 border-b" onClick={() => handleSort('recordName')}>
                                        Record Name {sortField === 'recordName' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </th>
                                    <th className="py-2 px-4 border-b" onClick={() => handleSort('shopName')}>
                                        Shop Name {sortField === 'shopName' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </th>
                                    <th className="py-2 px-4 border-b" onClick={() => handleSort('message')}>
                                        Message {sortField === 'message' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </th>
                                    <th className="py-2 px-4 border-b" onClick={() => handleSort('amount')}>
                                        Amount {sortField === 'amount' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </th>
                                    <th className="py-2 px-4 border-b" onClick={() => handleSort('paymentMethod')}>
                                        Payment Method {sortField === 'paymentMethod' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.filter(filterRecordsByShop).map((record) => (
                                    <tr key={record.id}>
                                        <td className="py-2 px-4 border-b">{formatDate(record.date)}</td>
                                        <td className="py-2 px-4 border-b">{record.recordName}</td>
                                        <td className="py-2 px-4 border-b">{record.shopName}</td>
                                        <td className="py-2 px-4 border-b">{record.message}</td>
                                        <td className="py-2 px-4 border-b">{record.amount}</td>
                                        <td className="py-2 px-4 border-b">{record.paymentMethod}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            <Modal isOpen={showModal} onRequestClose={() => setShowModal(false)}>
                <h2 className="text-2xl mb-4">Monthly Expenses</h2>
                <form onSubmit={handleModalSubmit}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white mb-4">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Date</th>
                                    <th className="py-2 px-4 border-b">Description</th>
                                    <th className="py-2 px-4 border-b">Debited Amount</th>
                                    <th className="py-2 px-4 border-b">Record Name</th>
                                    <th className="py-2 px-4 border-b">Shop Name</th>
                                    <th className="py-2 px-4 border-b">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importedData.map((record, index) => (
                                    <tr key={index}>
                                        <td className="py-2 px-4 border-b">{record.date}</td>
                                        <td className="py-2 px-4 border-b">{record.description}</td>
                                        <td className="py-2 px-4 border-b">{record.debitedAmount}</td>
                                        <td className="py-2 px-4 border-b">
                                            <select
                                                value={record.recordName}
                                                onChange={(e) => handleRecordNameChange(index, e.target.value)}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            >
                                               <InputRecord />
                                            </select>
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <select
                                                value={record.shopName}
                                                onChange={(e) => handleShopNameChange(index, e.target.value)}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            >
                                               <InputShopName/>
                                            </select>
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <input
                                                type="text"
                                                value={record.message}
                                                onChange={(e) => handleMessageChange(index, e.target.value)}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                    <div className="flex items-center justify-between">

                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Add Records
                        </button>
                        <Modal
            isOpen={showProcessingModal}
            onRequestClose={() => setShowProcessingModal(false)}
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                },
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    width: '300px'
                }
            }}
        >
            <h2 className="text-2xl mb-4">Processing...</h2>
            <div className="flex justify-center items-center">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            </div>
            <p className="mt-4">Please wait while the records are being added.</p>
        </Modal>

                        <button
                            onClick={() => setShowModal(false)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

            </Modal>




        </div>
    );
}

export default Records;

