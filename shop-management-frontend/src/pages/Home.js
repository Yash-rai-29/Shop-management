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
import 'tailwindcss/tailwind.css';

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
            filteredBillHistory = filteredBillHistory.filter(bill => bill.shop.toLowerCase() === selectedShop.toLowerCase());
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
        const totalCash = filterData().reduce((acc, bill) => acc + bill.totalPaymentReceived, 0);
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

        const brandSales = filteredBillHistory.reduce((acc, bill) => {
            bill.updatedStocks.forEach(stock => {
                acc[stock.product] = (acc[stock.product] || 0) + (stock.lastQuantity - stock.quantity);
            });
            return acc;
        }, {});

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            hover: {
                mode: 'nearest',
                intersect: true,
                onHover: (event, chartElement) => {
                    event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };

        const pieData = {
            labels: Object.keys(shopSales),
            datasets: [
                {
                    data: Object.values(shopSales),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    hoverBorderColor: 'rgba(0, 0, 0, 0.5)',
                    hoverBorderWidth: 2
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
                    hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)'
                },
            ],
        };

        const lineData = {
            labels: Object.keys(dailySales),
            datasets: Object.keys(shopSales).map((shop, index) => ({
                label: shop,
                data: filteredBillHistory.filter(bill => bill.shop === shop).map(bill => bill.totalSale),
                borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index],
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                pointHoverBorderColor: 'rgba(0, 0, 0, 0.5)',
                pointHoverBorderWidth: 2
            })),
        };

        const brandData = {
            labels: Object.keys(brandSales),
            datasets: [
                {
                    label: 'Brand Sales Quantity',
                    data: Object.values(brandSales),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    hoverBackgroundColor: 'rgba(153, 102, 255, 0.8)'
                },
            ],
        };

        return { pieData, barData, lineData, brandData, commonOptions };
    };

    const { pieData, barData, lineData, brandData, commonOptions } = prepareChartData();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-center text-indigo-600">Shop Management Dashboard</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            {loading ? (
                <div className="text-center text-indigo-600 animate-pulse">Loading...</div>
            ) : (
                <>
                    <div className="flex justify-center mb-6">
                        <div className="mr-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Select Shop</label>
                            <select
                                value={selectedShop}
                                onChange={handleShopChange}
                                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
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
                                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
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
                                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
                            />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Financial Summary</h2>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-700">Total Payment Received: <span className="font-bold">₹{totalCash.toFixed(2)}</span></p>
                                <p className="text-gray-700">Total Bank Deposit: <span className="font-bold">₹{totalPayments.toFixed(2)}</span></p>
                                <p className="text-gray-700">Remaining Cash: <span className="font-bold">₹{remainingCash.toFixed(2)}</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white p-6 rounded-lg shadow h-[400px]">
                            <h2 className="text-2xl font-bold mb-4">Total Sales Distribution</h2>
                            <div className="h-[300px]">
                                <Pie data={pieData} options={commonOptions} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow h-[400px]">
                            <h2 className="text-2xl font-bold mb-4">Daily Sales Amount</h2>
                            <div className="h-[300px]">
                                <Bar data={barData} options={commonOptions} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow h-[400px]">
                            <h2 className="text-2xl font-bold mb-4">Brand Sales Quantity</h2>
                            <div className="h-[300px]">
                                <Bar data={brandData} options={commonOptions} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow h-[400px]">
                            <h2 className="text-2xl font-bold mb-4">Sales Trend per Shop</h2>
                            <div className="h-[300px]">
                                <Line data={lineData} options={commonOptions} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;
