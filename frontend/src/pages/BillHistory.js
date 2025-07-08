import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { AuthContext } from "../context/AuthContext";
import { robotoRegularBase64 } from "./fonts";
import autoTable from "jspdf-autotable";

const BillHistory = () => {
  const [billHistory, setBillHistory] = useState([]);
  const [records, setRecords] = useState([]);
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [shop, setShop] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading: userLoading } = useContext(AuthContext);

  useEffect(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    setFromMonth(currentMonth);
    setToMonth(currentMonth);
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

    fetchData();
  }, [user, userLoading]);

  const handleFromMonthChange = (e) => {
    setFromMonth(e.target.value);
  };

  const handleToMonthChange = (e) => {
    setToMonth(e.target.value);
  };

  const handleShopChange = (e) => {
    setShop(e.target.value);
  };

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? `₹${amount.toFixed(2)}` : 'N/A';
  };

  const filterBillHistory = (billHistory, shop, fromMonth, toMonth) => {
    return billHistory.filter(bill => {
      const billDate = new Date(bill.pdfDate);
      const billMonth = billDate.toISOString().substring(0, 7);
      
      const isInDateRange = (!fromMonth || billMonth >= fromMonth) && 
                           (!toMonth || billMonth <= toMonth);
      const isInShop = !shop || bill.shop === shop;
      
      return isInDateRange && isInShop;
    });
  };

  const filterRecords = (records, shop, fromMonth, toMonth) => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.toISOString().substring(0, 7);
      
      const isInDateRange = (!fromMonth || recordMonth >= fromMonth) && 
                           (!toMonth || recordMonth <= toMonth);
      const isInShop = !shop || record.shopName.toLowerCase() === shop.toLowerCase();
      
      return isInDateRange && isInShop;
    });
  };

  const filteredBillHistory = filterBillHistory(billHistory, shop, fromMonth, toMonth);
  const filteredRecords = filterRecords(records, shop, fromMonth, toMonth);

  const totalCashInShop = filteredBillHistory.reduce((acc, bill) => acc + bill.totalPaymentReceived, 0);

  const exportAllTableData = async () => {
    try {
      const doc = new jsPDF();
      
      // Add the Roboto font
      doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto');

      // Title
      doc.setFontSize(16);
      doc.text("Bill History Report", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
      
      // Filter information
      doc.setFontSize(12);
      let filterInfo = `Period: ${fromMonth || 'All'} to ${toMonth || 'All'}`;
      if (shop) filterInfo += ` | Shop: ${shop}`;
      doc.text(filterInfo, doc.internal.pageSize.getWidth() / 2, 25, { align: "center" });

      // Summary
      doc.setFontSize(10);
      doc.text(`Total Records: ${filteredBillHistory.length}`, 14, 35);
      doc.text(`Total Cash: ${formatCurrency(totalCashInShop)}`, 14, 45);

      // Table data
      const tableData = filteredBillHistory.map(bill => [
        new Date(bill.pdfDate).toLocaleDateString(),
        formatCurrency(bill.totalSale),
        formatCurrency(bill.upiPayment),
        formatCurrency(bill.discount),
        formatCurrency(bill.totalDesiSale),
        formatCurrency(bill.totalBeerSale),
        formatCurrency(bill.breakageCash),
        formatCurrency(bill.canteenCash),
        formatCurrency(bill.salary),
        formatCurrency(bill.rateDiff),
        formatCurrency(bill.rent),
        formatCurrency(bill.transportation),
        formatCurrency(bill.totalPaymentReceived),
        bill.shop
      ]);

      // AutoTable for all data
      autoTable(doc, {
        startY: 55,
        head: [[
          "Date", "Total Sales", "UPI Payment", "Discount", "Desi Sales", 
          "Beer Sales", "Breakage Cash", "Canteen Cash", "Salary", 
          "Rate Diff", "Rent", "Transportation", "Total Cash", "Shop"
        ]],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 55 },
        didDrawPage: (data) => {
          // Add page numbers
          doc.setFontSize(10);
          doc.text(
            `Page ${data.pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        }
      });

      // Add totals summary on last page
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("Summary Totals:", 14, finalY);
      
      const totals = filteredBillHistory.reduce((acc, bill) => ({
        totalSale: acc.totalSale + (bill.totalSale || 0),
        upiPayment: acc.upiPayment + (bill.upiPayment || 0),
        discount: acc.discount + (bill.discount || 0),
        totalDesiSale: acc.totalDesiSale + (bill.totalDesiSale || 0),
        totalBeerSale: acc.totalBeerSale + (bill.totalBeerSale || 0),
        breakageCash: acc.breakageCash + (bill.breakageCash || 0),
        canteenCash: acc.canteenCash + (bill.canteenCash || 0),
        salary: acc.salary + (bill.salary || 0),
        rateDiff: acc.rateDiff + (bill.rateDiff || 0),
        rent: acc.rent + (bill.rent || 0),
        transportation: acc.transportation + (bill.transportation || 0),
        totalPaymentReceived: acc.totalPaymentReceived + (bill.totalPaymentReceived || 0)
      }), {
        totalSale: 0, upiPayment: 0, discount: 0, totalDesiSale: 0,
        totalBeerSale: 0, breakageCash: 0, canteenCash: 0, salary: 0,
        rateDiff: 0, rent: 0, transportation: 0, totalPaymentReceived: 0
      });

      let yPos = finalY + 10;
      doc.setFontSize(10);
      Object.entries(totals).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        doc.text(`${label}: ${formatCurrency(value)}`, 14, yPos);
        yPos += 8;
      });

      // Generate filename with date range
      const filename = `bill-history-${fromMonth || 'all'}-to-${toMonth || 'all'}-${shop || 'all-shops'}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const downloadInvoice = async (bill) => {
    try {
      const doc = new jsPDF();
      
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
      const startY = 30;
      doc.text(`Invoice Number: ${bill._id}`, 14, startY);
      doc.text(`Date: ${new Date(bill.pdfDate).toLocaleDateString()}`, 160, startY + 10);

      // AutoTable for stock details
      if (bill.updatedStocks && bill.updatedStocks.length > 0) {
        autoTable(doc, {
          startY: startY + 20,
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
              doc.setTextColor(0);
              doc.setFontSize(12);
              doc.text("Stock Details", data.settings.margin.left, startY + 10);
            }
          },
        });
      }

      // Function to add text and handle page breaks
      const addTextWithNewPage = (text, y) => {
        const pageHeight = doc.internal.pageSize.height;
        if (y > pageHeight - 10) {
          doc.addPage();
          y = 10;
        }
        doc.setFontSize(12);
        doc.text(text, 14, y);
        return y + 10;
      };

      // Footer details
      let yPosition = (doc.lastAutoTable?.finalY || startY + 40) + 20;
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
        const value = detail.value || 0;
        yPosition = addTextWithNewPage(`${detail.label}: ₹${value.toFixed(2)}`, yPosition);
      });

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
        
        {/* Filter Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="w-full">
              <label htmlFor="fromMonth" className="block mb-1 text-lg font-medium text-gray-700">
                From Month
              </label>
              <input
                type="month"
                id="fromMonth"
                value={fromMonth}
                onChange={handleFromMonthChange}
                className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="toMonth" className="block mb-1 text-lg font-medium text-gray-700">
                To Month
              </label>
              <input
                type="month"
                id="toMonth"
                value={toMonth}
                onChange={handleToMonthChange}
                className="border p-2 rounded w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="shop" className="block mb-1 text-lg font-medium text-gray-700">
                Filter by Shop
              </label>
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
            
            <div className="w-full flex items-end">
              <button
                onClick={exportAllTableData}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full transition-colors"
                disabled={loading || filteredBillHistory.length === 0}
              >
                Export All Data
              </button>
            </div>
          </div>
          
          {/* Summary Information */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Records Found: <strong>{filteredBillHistory.length}</strong></span>
            <span>Total Cash: <strong>{formatCurrency(totalCashInShop)}</strong></span>
            {filteredRecords.length > 0 && (
              <span>Related Records: <strong>{filteredRecords.length}</strong></span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border-collapse shadow-md text-sm md:text-base">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-3 px-4 border text-left">Date</th>
                  <th className="py-3 px-4 border text-right">Total Sales</th>
                  <th className="py-3 px-4 border text-right">UPI Payment</th>
                  <th className="py-3 px-4 border text-right">Discount</th>
                  <th className="py-3 px-4 border text-right">Desi Sales</th>
                  <th className="py-3 px-4 border text-right">Beer Sales</th>
                  <th className="py-3 px-4 border text-right">Breakage Cash</th>
                  <th className="py-3 px-4 border text-right">Canteen Cash</th>
                  <th className="py-3 px-4 border text-right">Salary</th>
                  <th className="py-3 px-4 border text-right">Rate Diff</th>
                  <th className="py-3 px-4 border text-right">Rent</th>
                  <th className="py-3 px-4 border text-right">Transportation</th>
                  <th className="py-3 px-4 border text-right">Total Cash</th>
                  <th className="py-3 px-4 border text-center">Shop</th>
                  <th className="py-3 px-4 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBillHistory.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="py-8 px-4 text-center text-gray-500">
                      No records found for the selected filters
                    </td>
                  </tr>
                ) : (
                  filteredBillHistory.map((bill) => (
                    <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border">
                        {new Date(bill.pdfDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.totalSale)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.upiPayment)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.discount)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.totalDesiSale)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.totalBeerSale)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.breakageCash)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.canteenCash)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.salary)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.rateDiff)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.rent)}</td>
                      <td className="py-3 px-4 border text-right">{formatCurrency(bill.transportation)}</td>
                      <td className="py-3 px-4 border text-right font-semibold">
                        {formatCurrency(bill.totalPaymentReceived)}
                      </td>
                      <td className="py-3 px-4 border text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {bill.shop}
                        </span>
                      </td>
                      <td className="py-3 px-4 border text-center">
                        <button
                          onClick={() => downloadInvoice(bill)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Download Invoice"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillHistory;
