import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
} from 'chart.js';
import { AuthContext } from "../context/AuthContext";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
);

const Home = () => {
    const { user, loading: userLoading } = useContext(AuthContext);
    const [billHistory, setBillHistory] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedShop, setSelectedShop] = useState('');
    const [dateFilter, setDateFilter] = useState('month'); // 'date', 'month', 'year', 'week'
    const [dateValue, setDateValue] = useState('');

    useEffect(() => {
        if (userLoading) return;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [billResponse, recordResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/billHistory`),
                    axios.get(`${process.env.REACT_APP_API_URL}/records`)
                ]);

                setBillHistory(billResponse.data);
                setRecords(recordResponse.data);
                console.log(recordResponse.data)
                setError('');
            } catch (error) {
                setError('Error fetching dashboard data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, userLoading]);

    const handleShopChange = (e) => {
        setSelectedShop(e.target.value);
    };

    const handleDateFilterChange = (e) => {
        setDateFilter(e.target.value);
        setDateValue(''); // reset date value on filter change
    };

    const handleDateValueChange = (e) => {
        setDateValue(e.target.value);
    };

    const filterData = () => {
        let filteredBillHistory = billHistory;

        if (selectedShop) {
            filteredBillHistory = filteredBillHistory.filter(bill => bill.shop === selectedShop);
        }

        if (dateValue) {
            filteredBillHistory = filteredBillHistory.filter(bill => {
                const billDate = new Date(bill.pdfDate);
                switch (dateFilter) {
                    case 'date':
                        return billDate.toISOString().split('T')[0] === dateValue;
                    case 'month':
                        return billDate.toISOString().substring(0, 7) === dateValue;
                    case 'year':
                        return billDate.getFullYear().toString() === dateValue;
                    case 'week':
                        const startOfWeek = new Date(dateValue);
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(endOfWeek.getDate() + 6);
                        return billDate >= startOfWeek && billDate <= endOfWeek;
                    default:
                        return true;
                }
            });
        }

        return filteredBillHistory;
    };

    // Calculate totals
    const calculateTotals = () => {
        const filteredRecords = records.filter(record => record.recordName === 'Receive Payment' && (!selectedShop || record.shopName.toLowerCase() === selectedShop.toLowerCase()));
        
        const totalPayments = filteredRecords.reduce((acc, record) => acc + record.amount, 0);
        const totalCash = billHistory.reduce((acc, bill) => acc + bill.totalPaymentReceived, 0);
        const remainingCash = totalCash - totalPayments;

        return { totalCash, totalPayments, remainingCash };
    };

    const { totalCash, totalPayments, remainingCash } = calculateTotals();

    // Prepare data for charts
    const prepareChartData = () => {
        const filteredBillHistory = filterData();

        const shopSales = filteredBillHistory.reduce((acc, bill) => {
            acc[bill.shop] = (acc[bill.shop] || 0) + bill.totalSale;
            return acc;
        }, {});

        const dailySales = filteredBillHistory.reduce((acc, bill) => {
            const date = new Date(bill.pdfDate).toLocaleDateString();
            acc[date] = (acc[date] || 0) + bill.totalSale;
            return acc;
        }, {});

        const pieData = {
            labels: Object.keys(shopSales),
            datasets: [
                {
                    data: Object.values(shopSales),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                },
            ],
        };

        const barData = {
            labels: Object.keys(dailySales),
            datasets: [
                {
                    label: 'Daily Sales Amount',
                    data: Object.values(dailySales),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
            ],
        };

        const lineData = {
            labels: Object.keys(dailySales),
            datasets: Object.keys(shopSales).map((shop, index) => ({
                label: shop,
                data: filteredBillHistory.filter(bill => bill.shop === shop).map(bill => bill.totalSale),
                borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index],
                fill: false,
            })),
        };

        return { pieData, barData, lineData };
    };

    const { pieData, barData, lineData } = prepareChartData();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Shop Management Dashboard</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <>
                    <div className="flex justify-center mb-6">
                        <div className="mr-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Select Shop</label>
                            <select
                                value={selectedShop}
                                onChange={handleShopChange}
                                className="border p-2 rounded w-full"
                            >
                                <option value="">All Shops</option>
                                <option value="vamanpui">Vamanpui</option>
                                <option value="amariya">Amariya</option>
                            </select>
                        </div>
                        <div className="mr-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Select Filter</label>
                            <select
                                value={dateFilter}
                                onChange={handleDateFilterChange}
                                className="border p-2 rounded w-full"
                            >
                                <option value="date">Date</option>
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                                <option value="week">Week</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Select {dateFilter}</label>
                            <input
                                type={dateFilter === 'week' ? 'date' : dateFilter}
                                value={dateValue}
                                onChange={handleDateValueChange}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <h2 className="text-xl font-bold mb-2">Financial Summary</h2>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-700">Total Payment Received: <span className="font-bold">₹{totalCash.toFixed(2)}</span></p>
                                <p className="text-gray-700">Total Bank Deposit: <span className="font-bold">₹{totalPayments.toFixed(2)}</span></p>
                                <p className="text-gray-700">Remaining Cash: <span className="font-bold">₹{remainingCash.toFixed(2)}</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-2">Total Sales Distribution</h2>
                            <Pie data={pieData} />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-2">Daily Sales Amount</h2>
                            <Bar data={barData} />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow col-span-1 md:col-span-2">
                            <h2 className="text-xl font-bold mb-2">Sales Trend per Shop</h2>
                            <Line data={lineData} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;