import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { AuthContext } from "../context/AuthContext";
import "tailwindcss/tailwind.css";
import Modal from "../components/Modal"; // Import the Modal component

import Modals from 'react-modal';

Modals.setAppElement('#root');
const Home = () => {
  const { user, loading: userLoading } = useContext(AuthContext);
  const [billHistory, setBillHistory] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [dateFilter, setDateFilter] = useState("month");
  const [dateValue, setDateValue] = useState("");
  const [areaData, setAreaData] = useState({ series: [], options: {} });
  const [pieData, setPieData] = useState({ series: [], options: {} });
  const [lineData, setLineData] = useState({ series: [], options: {} });
  const [brandData, setBrandData] = useState({ series: [], options: {} });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);

  const [selectedDate, setSelectedDate] = useState(null);

  const [showProcessingModal, setShowProcessingModal] = useState(true);


  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setShowProcessingModal(false);
    }, 2000); // Adjust the timeout as needed

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  const handleShopChange = (e) => {
    setSelectedShop(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setDateValue("");
  };

  const handleDateValueChange = (e) => {
    const value = e.target.value;
    setDateValue(value);
    if (value) {
      const date = new Date(value);
      setSelectedDate({ year: date.getFullYear(), month: date.getMonth() });
    } else {
      setSelectedDate(null); // Reset selected date if value is empty
    }
  };

  const getDateInputType = (filter) => {
    switch (filter) {
      case "date":
        return "date";
      case "month":
        return "month";
      case "year":
        return "number"; // Use number input for year
      case "week":
        return "week"; // Use week input for week
      default:
        return "date"; // Default to 'date' for safety
    }
  };

  useEffect(() => {
    if (userLoading) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [billResponse, recordResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/billHistory`),
          axios.get(`${process.env.REACT_APP_API_URL}/records`),
        ]);

        setBillHistory(billResponse.data);
        setRecords(recordResponse.data);
        setError("");
      } catch (error) {
        setError("Error fetching dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    console.log(billHistory);
  }, [user, userLoading]);

  const filterData = () => {
    let filteredBillHistory = billHistory;

    // Apply shop filter
    if (selectedShop) {
      filteredBillHistory = filteredBillHistory.filter(
        (bill) => bill.shop.toLowerCase() === selectedShop.toLowerCase()
      );
    }

    // Apply date filter
    if (dateValue) {
      filteredBillHistory = filteredBillHistory.filter((bill) => {
        const billDate = new Date(bill.pdfDate);
        switch (dateFilter) {
          case "date":
            return billDate.toISOString().split("T")[0] === dateValue;
          case "month":
            const selectedDate = new Date(dateValue);
            return (
              billDate.getMonth() === selectedDate.getMonth() &&
              billDate.getFullYear() === selectedDate.getFullYear()
            );
          case "year":
            return billDate.getFullYear().toString() === dateValue;
          case "week":
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



  let monthlyBankBalances = [];
  const startingBankBalance = 956320;
  
  // Initialize with the starting balance for the first month
  const initialMonth = {
    year: selectedDate ? selectedDate.year : new Date().getFullYear(),
    month: selectedDate ? selectedDate.month : new Date().getMonth(),
    balance: startingBankBalance,
  };
  
  monthlyBankBalances.push(initialMonth);
  
  const calculateOpeningBalance = () => {
    const selectedMonth = selectedDate ? selectedDate.month : null;
    const selectedYear = selectedDate ? selectedDate.year : null;
  
    // Ensure monthlyBankBalances array is populated up to the current selected month
    for (let year = initialMonth.year; year <= (selectedYear || new Date().getFullYear()); year++) {
      for (let month = (year === initialMonth.year ? initialMonth.month : 0); month < (year === selectedYear ? selectedMonth + 1 : 12); month++) {
        const index = year * 12 + month;
        if (!monthlyBankBalances[index]) {
          monthlyBankBalances[index] = {
            year,
            month,
            balance: startingBankBalance,
          };
        }
      }
    }
  
    const getPreviousMonthBalance = (month, year) => {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevIndex = prevYear * 12 + prevMonth;
      return monthlyBankBalances[prevIndex] ? monthlyBankBalances[prevIndex].balance : startingBankBalance;
    };
  
    const previousMonthBalance = selectedDate ? getPreviousMonthBalance(selectedMonth, selectedYear) : startingBankBalance;
  
    const totalBankDeduct = records.filter(
      (record) =>
        record.paymentMethod === "By Bank" &&
        record.recordName !== "Receive Payment By saving" &&
        new Date(record.date).getMonth() === selectedMonth &&
        new Date(record.date).getFullYear() === selectedYear
    ).reduce((acc, record) => acc + record.amount, 0);
  
    const totalPayments = records.filter(
      (record) =>
        record.recordName === "Receive Payment" &&
        new Date(record.date).getMonth() === selectedMonth &&
        new Date(record.date).getFullYear() === selectedYear
    ).reduce((acc, record) => acc + record.amount, 0);
  
    const totalUPIPayments = billHistory.filter(
      (bill) =>
        new Date(bill.date).getMonth() === selectedMonth &&
        new Date(bill.date).getFullYear() === selectedYear
    ).reduce((acc, bill) => acc + bill.upiPayment, 0);
  
    const totalOpeningBalance = previousMonthBalance + totalPayments + totalUPIPayments - totalBankDeduct;
  
    monthlyBankBalances[selectedYear * 12 + selectedMonth].balance = totalOpeningBalance;
  
    return totalOpeningBalance;
  };
  
  const openingBalance = calculateOpeningBalance();
  
  const calculateTotals = () => {
    const selectedMonth = selectedDate ? selectedDate.month : null;
    const selectedYear = selectedDate ? selectedDate.year : null;
  
    const isInSelectedMonth = (date) => {
      const recordDate = new Date(date);
      return (!selectedDate || (recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear));
    };
  
    const filterRecords = (recordName) => {
      return records.filter((record) => {
        const matchesRecordName = record.recordName === recordName;
        const matchesShop = !selectedShop || record.shopName.toLowerCase() === selectedShop.toLowerCase();
        return matchesRecordName && matchesShop && isInSelectedMonth(record.date);
      });
    };
  
     const filteredBillHistory = filterData()

    const totalPayments = filterRecords("Receive Payment").reduce((acc, record) => acc + record.amount, 0);
    const totalPurchaseStocks = filterRecords("Purchase Stock").reduce((acc, record) => acc + record.amount, 0);
    const totalCashPayments = records.filter(
      (record) =>
        record.paymentMethod === "By Cash" &&
        record.recordName !== "Receive Payment" &&
        (!selectedShop || record.shopName.toLowerCase() === selectedShop.toLowerCase()) &&
        isInSelectedMonth(record.date)
    ).reduce((acc, record) => acc + record.amount, 0);
  
    const totalUPIPayments = filteredBillHistory.reduce((acc, bill) => acc + bill.upiPayment, 0);
    const totalCash = filteredBillHistory.reduce((acc, bill) => acc + bill.totalPaymentReceived, 0);
    const totalRent = filteredBillHistory.reduce((acc, bill) => acc + bill.rent, 0);
    const totalTransportation = filteredBillHistory.reduce((acc, bill) => acc + (bill.transportation || 0), 0);
    const totalBreakageCash = filteredBillHistory.reduce((acc, bill) => acc + bill.breakageCash, 0);
  
    const remainingCash = Math.max(0, totalCash - totalPayments - totalCashPayments);
  
    const totalBankDeduct = records.filter(
      (record) =>
        record.paymentMethod === "By Bank" &&
        record.recordName !== "Receive Payment By saving" &&
        isInSelectedMonth(record.date)
    ).reduce((acc, record) => acc + record.amount, 0);
  
      const totalBankBalance = (openingBalance + totalPayments + totalUPIPayments - totalBankDeduct).toFixed(2);

    const totalExciseInspector = filterRecords("Excise Inspector Payment").reduce((acc, record) => acc + record.amount, 0);
    const totalDirectPurchase = filterRecords("Directly Purchase Stock").reduce((acc, record) => acc + record.amount, 0);
    const totalMMGD = filterRecords("MMGD").reduce((acc, record) => acc + record.amount, 0);
    const totalAssessment = filterRecords("assessment").reduce((acc, record) => acc + record.amount, 0);
    const totalCashHandling = filterRecords("Cash Handling Charges").reduce((acc, record) => acc + record.amount, 0);
    const totalOtherDeposit = filterRecords("Other Deposit").reduce((acc, record) => acc + record.amount, 0);
    const totalSalary = filterRecords("Salary").reduce((acc, record) => acc + record.amount, 0);
    const other = filterRecords("Other").reduce((acc, record) => acc + record.amount, 0);
    const totPartner1 = filterRecords("partner 1").reduce((acc, record) => acc + record.amount, 0);
    const totPartner2 = filterRecords("partner 2").reduce((acc, record) => acc + record.amount, 0);
  
    const totalSavingBankBalance = filterRecords("Saving Bank Added").reduce((acc, record) => acc + record.amount, 0);
  
    return {
      totalPayments,
      totalPurchaseStocks,
      totalUPIPayments,
      totalCash,
      totalBankBalance,
      totalExciseInspector,
      totalDirectPurchase,
      totalMMGD,
      totalAssessment,
      totalCashHandling,
      totalOtherDeposit,
      totalSavingBankBalance,
      openingBalance,
      totalRent,
      totalTransportation,
      totalBreakageCash,
      totalSalary,
      remainingCash,
      other,
      totPartner1,
      totPartner2
    };
  };
  

  // Example usage
  const {
    totalPayments,
    totalPurchaseStocks,
    totalUPIPayments,
    totalCash,
    totalBankBalance,
    totalExciseInspector,
    totalDirectPurchase,
    totalMMGD,
    totalAssessment,
    totalCashHandling,
    totalOtherDeposit,
    totalSavingBankBalance,
    totalOpeningBalance,
    totalRent,
    totalTransportation,
    totalBreakageCash,
    totalSalary,
    remainingCash,
    other,
    totPartner1,
    totPartner2
  } = calculateTotals();
  

    const formatNumberToIndianLocale = (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  };
  
 
  const handleRecordClick = (recordName) => {
    setModalTitle(`Details for ${recordName}`);
    const filteredData = records.filter(
      (record) =>
        record.recordName === recordName &&
        (!selectedShop ||
          record.shopName.toLowerCase() === selectedShop.toLowerCase()) &&
        (dateFilter !== "month" ||
          !dateValue ||
          new Date(record.date).getMonth() === new Date(dateValue).getMonth())
    );
    setModalData(filteredData);
    setIsModalOpen(true);
  };

  useEffect(() => {


    
    const { areaData, pieData, lineData, brandData } = prepareChartData();
    setAreaData(areaData);
    setPieData(pieData);
    setLineData(lineData);
    setBrandData(brandData);
  }, [billHistory, records, selectedShop, dateFilter, dateValue]);

  const prepareChartData = () => {
    const filteredBillHistory = filterData();

    const shopSales = filteredBillHistory.reduce((acc, bill) => {
      acc[bill.shop] = (acc[bill.shop] || 0) + bill.totalSale;
      return acc;
    }, {});

    const dailySales = filteredBillHistory.reduce((acc, bill) => {
      const date = new Date(bill.pdfDate).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + bill.totalSale;
      return acc;
    }, {});

    const brandSales = filteredBillHistory.reduce((acc, bill) => {
      bill.updatedStocks.forEach((stock) => {
        if (!stock.product.toLowerCase().includes("desi")) {
          acc[stock.product] =
            (acc[stock.product] || 0) + (stock.lastQuantity - stock.quantity);
        }
      });
      return acc;
    }, {});

    const sortedDates = Object.keys(dailySales).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const areaData = {
      series: [
        {
          name: "Daily Sales Amount",
          data: sortedDates.map((date) => dailySales[date]),
        },
      ],
      options: getChartOptions("area", {
        categories: sortedDates,
      }),
    };

    const pieData = {
      series: Object.values(shopSales),
      options: getChartOptions("pie", {
        labels: Object.keys(shopSales),
      }),
    };

    const lineData = {
      series: Object.keys(shopSales).map((shop) => ({
        name: shop,
        data: sortedDates.map((date) => {
          const billForDateAndShop = filteredBillHistory.find(
            (bill) =>
              bill.shop === shop &&
              new Date(bill.pdfDate).toISOString().split("T")[0] === date
          );
          return billForDateAndShop ? billForDateAndShop.totalSale : 0;
        }),
      })),
      options: getChartOptions("line", {
        categories: sortedDates.map((date) =>
          new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          })
        ),
      }),
    };

    const brandData = {
      series: [
        {
          name: "Brand Sales Quantity",
          data: Object.values(brandSales),
        },
      ],
      options: getChartOptions("bar", {
        categories: Object.keys(brandSales),
      }),
    };

    return { areaData, pieData, lineData, brandData };
  };

  const getChartOptions = (type, options) => {
    switch (type) {
      case "area":
        return {
          chart: {
            type: "area",
            height: 350,
          },
          xaxis: {
            categories: options.categories,
            axisBorder: {
              show: false,
            },
            axisTicks: {
              show: false,
            },
            labels: {
              show: true,
              style: {
                fontFamily: "Inter, sans-serif",
                cssClass: "text-xs font-normal",
                colors: "#ffffff", // Set the label color to white
              },
              format: "dd/MM", // Display format for x-axis labels
            },
          },
          yaxis: {
            show: true,
            show: true, // Ensure the y-axis is shown
            labels: {
              style: {
                colors: "#ffffff", // Set the label color to white
                fontFamily: "Inter, sans-serif",
                cssClass: "text-xs font-normal",
              },
            },
          },
          fill: {
            type: "gradient",
            stroke: {
              width: 6,
            },
          },
          dataLabels: {
            enabled: false,
          },
          grid: {
            show: false,
          },
          tooltip: {
            x: {
              format: "dd/MM",
            },
          },
        };
      case "pie":
        return {
          chart: {
            type: "pie",
            height: 350,
          },
          labels: options.labels,
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200,
                },
                legend: {
                  position: "bottom",
                },
              },
            },
          ],
        };
      case "line":
        return {
          chart: {
            height: "100%",
            maxWidth: "100%",
            type: "line",
            fontFamily: "Inter, sans-serif",
            dropShadow: {
              enabled: false,
            },
            toolbar: {
              show: false,
            },
          },
          tooltip: {
            enabled: true,
            x: {
              show: false,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 6,
            curve: "smooth",
          },
          grid: {
            show: false,
          },
          legend: {
            show: false,
          },
          xaxis: {
            categories: options.categories,
            labels: {
              show: true,
              style: {
                fontFamily: "Inter, sans-serif",
                cssClass: "text-xs font-normal",
                colors: "#ffffff", // Set the label color to white
              },
              format: "dd/MM", // Display format for x-axis labels
            },
            axisBorder: {
              show: false,
            },
            axisTicks: {
              show: false,
            },
          },

          yaxis: {
            show: true, // Ensure the y-axis is shown
            labels: {
              style: {
                colors: "#ffffff", // Set the label color to white
                fontFamily: "Inter, sans-serif",
                cssClass: "text-xs font-normal",
              },
            },
          },
        };

      case "bar":
        return {
          chart: {
            type: "bar",
            height: 350,
            sparkline: {
              enabled: false,
            },
            type: "bar",
            width: "100%",
            toolbar: {
              show: false,
            },
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "70%",
              borderRadiusApplication: "end",
              borderRadius: 8,
            },
          },
          tooltip: {
            shared: true,
            intersect: false,
            style: {
              fontFamily: "Inter, sans-serif",
            },
          },
          states: {
            hover: {
              filter: {
                type: "darken",
                value: 1,
              },
            },
          },
          stroke: {
            show: true,
            width: 0,
            colors: ["transparent"],
          },
          grid: {
            show: false,
            strokeDashArray: 4,
            padding: {
              left: 2,
              right: 2,
              top: -14,
            },
          },
          xaxis: {
            categories: options.categories,
            labels: {
              show: true,
              style: {
                fontFamily: "Inter, sans-serif",
                cssClass: "text-xs font-normal",
                colors: "#ffffff", // Set the label color to white
              },
            },
            axisTicks: {
              show: false,
            },
            axisBorder: {
              show: false,
            },
          },
          yaxis: {
            show: true, // Ensure the y-axis is shown
            labels: {
              style: {
                colors: "#ffffff", // Set the label color to white
                fontFamily: "Inter, sans-serif",
                cssClass: "text-xs font-normal",
              },
            },
          },
        };
      default:
        return {};
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  const filteredData = filterData();
  const monthlyTotals = {};
  const currentYear = new Date().getFullYear();

  billHistory.forEach((bill) => {
    const billDate = new Date(bill.pdfDate);
    const month = billDate.getMonth();
    const year = billDate.getFullYear();

    if (year !== currentYear) return;

    if (!monthlyTotals[month]) {
      monthlyTotals[month] = 0;
    }

    monthlyTotals[month] += bill.totalPaymentReceived;
  });

  const handleShowModal = (title, data) => {
    setModalTitle(title);
    setModalData(data);
    setIsModalOpen(true);
  };
  const handleClearFilters = () => {
    setSelectedShop("");
    setDateFilter("month");
    setDateValue("");
    setSelectedDate(null); // Reset selectedDate state if you have it
    calculateTotals(); // Re-run calculations with cleared filters
  };
  

  return (
    <div className=" p-4 h-auto bg-blue-300">
        <Modals
        isOpen={showProcessingModal}
        onRequestClose={() => setShowProcessingModal(false)}
        style={{
          overlay: {
            backgroundColor: 'lightblue'
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
        <p className="mt-4">Please wait while the data is being Loaded.</p>
      </Modals>
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-4 ml-96">Dashboard</h2>
        <div className="ml-auto flex space-x-2">
          <select
            onChange={handleShopChange}
            value={selectedShop}
            className="p-2 border rounded bg-white hover:shadow-md focus:outline-none"
          >
            <option value="">All Shops</option>
            {Array.from(new Set(billHistory.map((bill) => bill.shop))).map(
              (shop) => (
                <option key={shop} value={shop}>
                  {shop}
                </option>
              )
            )}
          </select>
          <select
            onChange={handleDateFilterChange}
            value={dateFilter}
            className="p-2 border rounded bg-white hover:shadow-md focus:outline-none"
          >
            <option value="date">Date</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="week">Week</option>
          </select>
          <input
            type={getDateInputType(dateFilter)}
            onChange={handleDateValueChange}
            value={dateValue}
            className="p-2 border rounded bg-white hover:shadow-md focus:outline-none"
          />
          <button
            onClick={handleClearFilters}
            className="p-2 border rounded bg-white hover:shadow-md focus:outline-none"
          >
            Clear Filters
          </button>
        </div>
      </header>

      <div className="flex gap-4 w-auto justify-around m-4">
        <div className="flex flex-wrap gap-8 h-auto w-100%">
          <div className="bg-gray-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center rounded-md w-52">
            <h3 className="text-xl font-semibold mb-2">Total Sales Cash</h3>
            <p className="text-xl">₹ {formatNumberToIndianLocale(totalCash)}</p>
          </div>
          <div className="bg-green-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center rounded-md w-52">
            <h3 className="text-xl font-semibold mb-2">Total Bank Deposit</h3>
            <p className="text-xl">₹ {formatNumberToIndianLocale(totalPayments)}</p>
          </div>
          <div className="bg-yellow-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center rounded-md w-52">
            <h3 className="text-xl font-semibold mb-2">Total UPI Payments</h3>
            <p className="text-xl">₹ {formatNumberToIndianLocale(totalUPIPayments)}</p>
          </div>
          <div className="bg-purple-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center rounded-md w-52">
            <h3 className="text-xl font-semibold mb-2">Remaining Cash</h3>
            <p className="text-xl">₹ {formatNumberToIndianLocale(remainingCash)}</p>
          </div>
          <div className="bg-red-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center w-52 rounded-md">
            <h3 className="text-xl font-semibold mb-2">Current Bank</h3>
            <p className="text-xl">₹ {formatNumberToIndianLocale(totalBankBalance)}</p>
          </div>
          <div className="bg-red-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center w-52 rounded-md"
           onClick={() => handleRecordClick("Saving Bank Added")}>
            <h3 className="text-xl font-semibold mb-2">Saving Bank</h3>
            <p className="text-xl">₹ {formatNumberToIndianLocale(totalSavingBankBalance)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap w-full">
        <div
          className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-indigo-900 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md m-3"
          style={{ width: "48%" }}
        >
          <h2 className="text-xl font-bold text-white mb-2 text-center">
            Sales Trend by Shop
          </h2>
          <ReactApexChart
            options={lineData.options}
            series={lineData.series}
            type="line"
            height={350}
          />
        </div>
        <div
          className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-indigo-900 p-4 w-full shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md m-3"
          style={{ width: "48%" }}
        >
          <h2 className="text-xl font-bold text-white mb-2 text-center">
            Records Data
          </h2>
          <div className="flex flex-wrap  justify-center items-center  w-full gap-6 ">
            <div
              className="bg-red-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center w-52 rounded-md "
              onClick={() => handleRecordClick("Purchase Stock")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total Purchase Stock
              </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalPurchaseStocks)}</p>
            </div>
            <div
              className="bg-rose-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center w-52 rounded-md "
              onClick={() => handleRecordClick("Excise Inspector Payment")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total Excise Inspector
              </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalExciseInspector)}</p>
            </div>
            <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("Directly Purchase Stock")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total Direct Purchase
              </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalDirectPurchase)}</p>
            </div>

            <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("MMGD")}
            >
              <h3 className="font-semibold text-lg mb-2">Total MMGD Fees</h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalMMGD)}</p>
            </div>
            <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("assessment")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total Assesment Fees
              </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalAssessment)}</p>
            </div>
            <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("Cash Handling Charges")}
            >
              <h3 className="font-semibold text-lg mb-2">
              Cash Handling 
              </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalCashHandling)}</p>
            </div>

            <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("Receive Payment By saving")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Saving to Current</h3>
                <p className="text-xl">₹ </p>
            </div>

            <div
              className="bg-emerald-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("Salary")}
            >
              <h3 className="font-semibold text-lg mb-2">Total Salary</h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalSalary)}</p>
            </div>

            <div
              className="bg-emerald-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("Other")}
            >
              <h3 className="font-semibold text-lg mb-2">Other</h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(other)}</p>
            </div>

            <div className="bg-indigo-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md ">
              <h3 className=" font-semibold text-lg mb-2">Total Rent </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalRent)}</p>
            </div>
            <div className="bg-amber-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md ">
              <h3 className=" font-semibold text-lg mb-2">
                Total Transportation{" "}
              </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalTransportation)}</p>
            </div>
            <div className="bg-yellow-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md ">
              <h3 className=" font-semibold text-lg mb-2">
                Total BreakageCash{" "}
              </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totalBreakageCash)}</p>
            </div>
            <div className="bg-violet-300    p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md ">
              <h3 className=" font-semibold text-lg mb-2">
                Chandra Bhan Rai{" "}
              </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totPartner1)}</p>
            </div>
            <div className="bg-fuchsia-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md ">
              <h3 className=" font-semibold text-lg mb-2">
              Kailash Rai{" "}
              </h3>
              <p className="text-xl">₹ {formatNumberToIndianLocale(totPartner2)}</p>
            </div>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title={modalTitle}
              data={modalData}
            />
          </div>
        </div>
        <div
          className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-indigo-900 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md m-3"
          style={{ width: "48%" }}
        >
          <h2 className="text-xl text-white font-bold mb-2 text-center">
            Brand Sales
          </h2>
          <ReactApexChart
            options={brandData.options}
            series={brandData.series}
            type="bar"
            height={350}
          />
        </div>
        <div
          className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-indigo-900 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md m-3"
          style={{ width: "48%" }}
        >
          <h2 className="text-xl font-bold mb-2 text-center text-white">
            Daily Sales
          </h2>
          <ReactApexChart
            options={areaData.options}
            series={areaData.series}
            type="area"
            height={300}
          />
        </div>
        <div
          className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-indigo-900 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md m-3"
          style={{ width: "48%" }}
        >
          <h2 className="text-xl font-bold mb-2 text-center text-white">
            Total Sales Distribution
          </h2>
          <ReactApexChart
            options={pieData.options}
            series={pieData.series}
            type="pie"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
