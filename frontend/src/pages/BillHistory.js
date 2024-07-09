import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { AuthContext } from "../context/AuthContext";
import { robotoRegularBase64 } from "./fonts"; // Adjust the path as necessary
import autoTable from "jspdf-autotable";

const BillHistory = () => {
  const [billHistory, setBillHistory] = useState([]);
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState('');
  const [shop, setShop] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading: userLoading } = useContext(AuthContext);

  useEffect(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    setMonth(currentMonth);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (userLoading) return;

      setLoading(true);
      try {
        if (!user || !user.token) {
          throw new Error('User not authenticated');
        }

        const [billResponse, recordResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/billHistory`, {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/records`, {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);

        setBillHistory(billResponse.data);
        setRecords(recordResponse.data);
        setError('');
      } catch (error) {
        setError('Error fetching data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    console.log(billHistory);

    fetchData();
  }, [user, userLoading]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const handleShopChange = (e) => {
    setShop(e.target.value);
  };

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? `₹${amount.toFixed(2)}` : 'N/A';
  };

  const filterBillHistory = (billHistory, shop, month) => {
    return billHistory.filter(bill => {
      const billDate = new Date(bill.pdfDate);
      const billMonth = billDate.toISOString().substring(0, 7);
      return (!shop || bill.shop === shop) && billMonth === month;
    });
  };

  const filterRecords = (records, shop, month) => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.toISOString().substring(0, 7);
      return (!shop || record.shopName.toLowerCase() === shop.toLowerCase()) &&
        recordMonth === month;
    });
  };

  const filteredBillHistory = filterBillHistory(billHistory, shop, month);

  const filteredRecords = filterRecords(records, shop, month);

  const totalCashInShop = filteredBillHistory.reduce((acc, bill) => acc + bill.totalPaymentReceived, 0);
  const downloadInvoice = async (bill) => {
    try {
      const doc = new jsPDF();
      
      console.log(bill.updatedStocks);
      
      // Add the Roboto font
      doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto');

      // Title and shop name
      doc.setFontSize(16);
      doc.text("Om Ganeshay Namah", doc.internal.pageSize.getWidth() / 2, 10, { align: "center" });
      doc.setFontSize(14);
      doc.text(`Shop Name: ${bill.shop}`, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

      // Invoice details
      doc.setFontSize(12);
      const startY = 30; // Starting Y position for invoice details
      doc.text(`Invoice Number: ${bill._id}`, 14, startY);
      doc.text(`Date: ${new Date(bill.pdfDate).toLocaleDateString()}`, 160, startY + 10);

      // AutoTable for stock details
      autoTable(doc, {
        startY: startY + 20, // Adjusted startY to ensure there's no overlap
        head: [["Product", "Size", "Open Stock", "Closing Stock", "Quantity Sold", "Price", "Total Sale (₹)"]],
        body: bill.updatedStocks.map(stock => [
          stock.product,
          stock.size,
          stock.lastQuantity,
          stock.newQuantity,
          stock.lastQuantity - stock.newQuantity,
          stock.price,
          ((stock.lastQuantity - stock.newQuantity) * stock.price).toFixed(2)
        ]),
        didDrawPage: (data) => {
          if (data.pageNumber === 1) {
            // Add header row on the first page
            doc.setTextColor(0);
            doc.setFontSize(12);
            doc.text("Stock Details", data.settings.margin.left, startY + 10);
          }
        },
      });

      // Function to add text and handle page breaks
      const addTextWithNewPage = (text, y) => {
        const pageHeight = doc.internal.pageSize.height;
        if (y > pageHeight - 10) {
          doc.addPage();
          y = 10; // Reset y position for the new page
        }
        doc.setFontSize(12); // Set font size explicitly
        doc.text(text, 14, y);
        return y + 10; // Increment y position for the next line
      };

      // Footer details
      let yPosition = doc.lastAutoTable.finalY + 20; // Start after the table with more spacing
      const footerDetails = [
        { label: "Total Sales", value: bill.totalSale },
        { label: "UPI Payment", value: bill.upiPayment },
        { label: "Discount", value: bill.discount },
        { label: "Desi Sales", value: bill.totalDesiSale },
        { label: "Beer Sales", value: bill.totalBeerSale },
        { label: "Breakage Cash", value: bill.breakageCash },
        { label: "Canteen Cash", value: bill.canteenCash },
        { label: "Salary", value: bill.salary },
        { label: "Rate Diff", value: bill.rateDiff },
        { label: "Rent", value: bill.rent },
        { label: "Transportation", value: bill.transportation },
        { label: "Total Cash", value: bill.totalPaymentReceived },
      ];

      footerDetails.forEach(detail => {
        const value = detail.value || 0; // Default to 0 if value is undefined or null
        yPosition = addTextWithNewPage(`${detail.label}: ₹${value.toFixed(2)}`, yPosition);
      });

      // Save the PDF with a unique name
      doc.save(`invoice-${bill._id}.pdf`);
    } catch (error) {
      console.error("Error generating invoice:", error);
    }
  };

  return (
    <div className="p-6 bg-blue-300 min-h-screen text-gray-900">
      <div className="max-w-full mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl mb-6 text-center font-semibold">Bill History</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="w-full">
            <label htmlFor="month" className="block mb-1 text-lg font-medium text-gray-700">Filter by Month</label>
            <input
              type="month"
              id="month"
              value={month}
              onChange={handleMonthChange}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="w-full">
            <label htmlFor="shop" className="block mb-1 text-lg font-medium text-gray-700">Filter by Shop</label>
            <select
              id="shop"
              value={shop}
              onChange={handleShopChange}
              className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Shops</option>
              <option value="Vamanpui">Vamanpui</option>
              <option value="Amariya">Amariya</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border-collapse shadow-md text-sm md:text-base">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-2 px-4 border">Date</th>
                  <th className="py-2 px-4 border">Total Sales</th>
                  <th className="py-2 px-4 border">UPI Payment</th>
                  <th className="py-2 px-4 border">Discount</th>
                  <th className="py-2 px-4 border">Desi Sales</th>
                  <th className="py-2 px-4 border">Beer Sales</th>
                  <th className="py-2 px-4 border">Breakage Cash</th>
                  <th className="py-2 px-4 border">Canteen Cash</th>
                  <th className="py-2 px-4 border">Salary</th>
                  <th className="py-2 px-4 border">Rate Diff</th>
                  <th className="py-2 px-4 border">Rent</th>
                  <th className="py-2 px-4 border">Transportation</th>
                  <th className="py-2 px-4 border">Total Cash</th>
                  <th className="py-2 px-4 border">Shop</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBillHistory.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border">{new Date(bill.pdfDate).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.totalSale)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.upiPayment)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.discount)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.totalDesiSale)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.totalBeerSale)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.breakageCash)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.canteenCash)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.salary)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.rateDiff)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.rent)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.transportation)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(bill.totalPaymentReceived)}</td>
                    <td className="py-2 px-4 border">{bill.shop}</td>
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() => downloadInvoice(bill)}
                        className="text-blue-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="white"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="w-7 h-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v16h16V4H4zm4 8l4 4m0 0l4-4m-4 4V8"
                          />
                        </svg>
                      </button>
                    </td>
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
