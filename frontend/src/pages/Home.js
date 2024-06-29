import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { AuthContext } from "../context/AuthContext";
import "tailwindcss/tailwind.css";
import Modal from "../components/Modal"; // Import the Modal component

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
  }, [user, userLoading]);

  const handleShopChange = (e) => {
    setSelectedShop(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setDateValue("");
  };

  const handleDateValueChange = (e) => {
    setDateValue(e.target.value);
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
  
    console.log("Filtered Bill History:", filteredBillHistory); // Check filtered data
  
    return filteredBillHistory;
  };

  
  
  const calculateTotals = () => {
    const filteredPayments = records.filter((record) => {
      const isReceivePayment = record.recordName === "Receive Payment";
      const matchesShop =
        !selectedShop ||
        record.shopName.toLowerCase() === selectedShop.toLowerCase();
  
      if (dateFilter === "month" && dateValue) {
        const paymentDate = new Date(record.date);
        const selectedDate = new Date(dateValue);
        return (
          isReceivePayment &&
          matchesShop &&
          paymentDate.getMonth() === selectedDate.getMonth() &&
          paymentDate.getFullYear() === selectedDate.getFullYear()
        );
      }
  
      return isReceivePayment && matchesShop;
    });
  
    const filteredPurchaseStocks = records.filter(
      (record) =>
        record.recordName === "Purchase Stock" &&
        (!selectedShop ||
          record.shopName.toLowerCase() === selectedShop.toLowerCase())
    );
  
    const totalPayments = filteredPayments.reduce(
      (acc, record) => acc + record.amount,
      0
    );
  
    const filteredBillHistory = filterData();
  
    const totalPurchaseStocks = filteredPurchaseStocks.reduce(
      (acc, record) => acc + record.amount,
      0
    );
  
    const totalUPIPayments = filteredBillHistory.reduce(
      (acc, bill) => acc + bill.upiPayment,
      0
    );
  
    const totalCash = filteredBillHistory.reduce(
      (acc, bill) => acc + bill.totalPaymentReceived,
      0
    );
  
    const totalBankBalance = totalPayments + totalUPIPayments;
  
    const totalExciseInspector = records
      .filter(
        (record) =>
          record.recordName === "Excise Inspector Payment" &&
          (!selectedShop ||
            record.shopName.toLowerCase() === selectedShop.toLowerCase())
      )
      .reduce((acc, record) => acc + record.amount, 0);
  
    const totalPurchaseBalance = records
      .filter(
        (record) =>
          record.recordName === "Purchase Stock" &&
          (!selectedShop ||
            record.shopName.toLowerCase() === selectedShop.toLowerCase())
      )
      .reduce((acc, record) => acc + record.amount, 0);
  
    const totalDirectPurchase = records
      .filter(
        (record) =>
          record.recordName === "Directly Purchase Stock" &&
          (!selectedShop ||
            record.shopName.toLowerCase() === selectedShop.toLowerCase())
      )
      .reduce((acc, record) => acc + record.amount, 0);
  
    const totalSalary = records
      .filter(
        (record) =>
          record.recordName === "Salary" &&
          (!selectedShop ||
            record.shopName.toLowerCase() === selectedShop.toLowerCase())
      )
      .reduce((acc, record) => acc + record.amount, 0);
  

      const totalmmgd = records
      .filter(
        (record) =>
          record.recordName === "MMGD" &&
          (!selectedShop ||
            record.shopName.toLowerCase() === selectedShop.toLowerCase())
      )
      .reduce((acc, record) => acc + record.amount, 0);
  
      const totalassessment = records
      .filter(
        (record) =>
          record.recordName === "assessment" &&
          (!selectedShop ||
            record.shopName.toLowerCase() === selectedShop.toLowerCase())
      )
      .reduce((acc, record) => acc + record.amount, 0);
  
  
      const totalCashHandling = records
      .filter(
        (record) =>
          record.recordName === "Cash Handling Charges" &&
          (!selectedShop ||
            record.shopName.toLowerCase() === selectedShop.toLowerCase())
      )
      .reduce((acc, record) => acc + record.amount, 0);
  
      const totalbankdepositbybank = records
      .filter(
        (record) =>
          record.recordName === "Receive Payment By Bank" &&
          (!selectedShop ||
            record.shopName.toLowerCase() === selectedShop.toLowerCase())
      )
      .reduce((acc, record) => acc + record.amount, 0);
  

    const totalRent = filteredBillHistory.reduce(
      (acc, bill) => acc + (bill.rent || 0),
      0
    );
  
    const totalTransportation = filteredBillHistory.reduce(
      (acc, bill) => acc + (bill.transportation || 0),
      0
    );
  
    const totalBreakageCash = filteredBillHistory.reduce(
      (acc, bill) => acc + (bill.breakageCash || 0),
      0
    );
  
const totalCashPayments = records
  .filter(
    (record) =>
      record.paymentMethod === "By Cash" &&
      record.recordName !== "Receive Payment" &&
      (!selectedShop ||
        record.shopName.toLowerCase() === selectedShop.toLowerCase())
  )
  .reduce((acc, record) => acc + record.amount, 0);

const remainingCash = Math.max(
  0,
  totalCash - totalPayments - totalCashPayments
);

const startingBankBalance = 956320.15;

const totalBankBalanceAfterDeducting = records.reduce((acc, record) => {
  if (record.paymentMethod === "By Bank") {
    if (
      record.recordName === "Receive Payment" ||
      record.recordName === "Receive Payment By Bank"
    ) {
      return acc + record.amount;
    } else {
      return acc - record.amount;
    }
  }
  return acc;
}, startingBankBalance + totalBankBalance);



    return {
      totalCash,
      totalPayments,
      remainingCash,
      totalUPIPayments,
      totalPurchaseStocks,
      totalBankBalance,
      totalExciseInspector,
      totalDirectPurchase,
      totalBankBalanceAfterDeducting,
      totalSalary,
      totalRent,
      totalTransportation,
      totalBreakageCash,
      totalPurchaseBalance,
      totalmmgd,
    totalassessment,
    totalCashHandling,totalbankdepositbybank

  };
  };
  
  const {
    totalCash,
    totalPayments,
    remainingCash,
    totalBankBalanceAfterDeducting,
    totalUPIPayments,
    totalBankBalance,
    totalPurchaseStocks,
    totalExciseInspector,

    totalDirectPurchase,
    totalSalary,
    totalRent,
    totalTransportation,
    totalBreakageCash,
    totalPurchaseBalance,
    totalmmgd,
    totalassessment,
    totalCashHandling,totalbankdepositbybank

  } = calculateTotals();

  const handleRecordClick = (recordName) => {
    setModalTitle(`Details for ${recordName}`);
    const filteredData = records.filter(
      (record) =>
        record.recordName === recordName &&
        (!selectedShop ||
          record.shopName.toLowerCase() === selectedShop.toLowerCase()) &&
        (dateFilter !== "month" || !dateValue ||
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

  const handleClearFilters = () => {
    setSelectedShop("");
    setDateFilter("month");
    setDateValue("");
  };

  return (
    <div className=" p-4 h-auto bg-blue-300">
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
            <p className="text-xl">₹ {totalCash.toFixed(2)}</p>
          </div>
          <div className="bg-green-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center rounded-md w-52">
            <h3 className="text-xl font-semibold mb-2">Total Bank Deposit</h3>
            <p className="text-xl">₹ {totalPayments.toFixed(2)}</p>
          </div>
          <div className="bg-yellow-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center rounded-md w-52">
            <h3 className="text-xl font-semibold mb-2">Total UPI Payments</h3>
            <p className="text-xl">₹ {totalUPIPayments.toFixed(2)}</p>
          </div>
          <div className="bg-purple-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center rounded-md w-52">
            <h3 className="text-xl font-semibold mb-2">Remaining Cash</h3>
            <p className="text-xl">₹ {remainingCash.toFixed(2)}</p>
          </div>
          <div className="bg-red-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center w-52 rounded-md">
            <h3 className="text-xl font-semibold mb-2">Total Bank Balance</h3>
            <p className="text-xl">
              ₹ {totalBankBalanceAfterDeducting.toFixed(2)}
            </p>
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
              <p className="text-xl">₹ {totalPurchaseBalance.toFixed(2)}</p>
            </div>
            <div
              className="bg-rose-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center w-52 rounded-md "
              onClick={() => handleRecordClick("Excise Inspector Payment")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total Excise Inspector
              </h3>
              <p className="text-xl">₹ {totalExciseInspector.toFixed(2)}</p>
            </div>
            <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("Directly Purchase Stock")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total Direct Purchase
              </h3>
              <p className="text-xl">₹ {totalDirectPurchase.toFixed(2)}</p>
            </div>

            <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("MMGD")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total MMGD Fees
              </h3>
              <p className="text-xl">₹ {totalmmgd.toFixed(2)}</p>
            </div>
            <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("assessment")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total Assesment Fees
              </h3>
              <p className="text-xl">₹ {totalassessment.toFixed(2)}</p>
            </div>
             <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("Cash Handling Charges")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total Cash HandlingCharge
              </h3>
              <p className="text-xl">₹ {totalCashHandling.toFixed(2)}</p>
            </div>
             <div
              className="bg-teal-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("Receive Payment By Bank")}
            >
              <h3 className="font-semibold text-lg mb-2">
                Total Bank Deposit By Bank
              </h3>
              <p className="text-xl">₹ {totalbankdepositbybank.toFixed(2)}</p>
            </div>


            <div
              className="bg-emerald-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md "
              onClick={() => handleRecordClick("Salary")}
            >
              <h3 className="font-semibold text-lg mb-2">Total Salary</h3>
              <p className="text-xl">₹ {totalSalary.toFixed(2)}</p>
            </div>

            <div className="bg-indigo-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md ">
              <h3 className=" font-semibold text-lg mb-2">Total Rent </h3>
              <p className="text-xl">₹ {totalRent.toFixed(2)}</p>
            </div>
            <div className="bg-amber-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md ">
              <h3 className=" font-semibold text-lg mb-2">
                Total Transportation{" "}
              </h3>
              <p className="text-xl">₹ {totalTransportation.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-centerr w-52 rounded-md ">
              <h3 className=" font-semibold text-lg mb-2">
                Total BreakageCash{" "}
              </h3>
              <p className="text-xl">₹ {totalBreakageCash.toFixed(2)}</p>
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
