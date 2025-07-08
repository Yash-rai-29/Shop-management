import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AuthContext } from "../context/AuthContext";
import { robotoRegularBase64 } from "./fonts";

const BillHistory = () => {
  /* ──────────────────── state ──────────────────── */
  const [billHistory, setBillHistory]   = useState([]);
  const [records, setRecords]           = useState([]);
  const [fromMonth, setFromMonth]       = useState("");
  const [toMonth, setToMonth]           = useState("");
  const [shop, setShop]                 = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const { user, loading: userLoading }  = useContext(AuthContext);

  /* ───────────────── default month ──────────────── */
  useEffect(() => {
    const thisMonth = new Date().toISOString().substring(0, 7);
    setFromMonth(thisMonth);
    setToMonth(thisMonth);
  }, []);

  /* ───────────────── fetch data ─────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      if (userLoading) return;
      setLoading(true);

      try {
        if (!user?.token) throw new Error("User not authenticated");

        const [billRes, recRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/billHistory`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/records`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        setBillHistory(billRes.data);
        setRecords(recRes.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userLoading]);

  /* ──────────────── helpers & filters ───────────── */
  const formatCurrency = (num) =>
    typeof num === "number" ? `₹${num.toFixed(2)}` : "N/A";

  const filterBillHistory = () =>
    billHistory.filter((b) => {
      const billMonth = new Date(b.pdfDate).toISOString().substring(0, 7);
      const inRange =
        (!fromMonth || billMonth >= fromMonth) &&
        (!toMonth || billMonth <= toMonth);
      const inShop = !shop || b.shop === shop;
      return inRange && inShop;
    });

  const filteredBillHistory = filterBillHistory();

  const totalCash = filteredBillHistory.reduce(
    (acc, b) => acc + (b.totalPaymentReceived || 0),
    0
  );

  /* ─────────────────── CSV export ───────────────── */
  const exportCSV = () => {
    if (!filteredBillHistory.length) return;

    const headers = [
      "Date",
      "Total Sales",
      "UPI Payment",
      "Discount",
      "Desi Sales",
      "Beer Sales",
      "Breakage Cash",
      "Canteen Cash",
      "Salary",
      "Rate Diff",
      "Rent",
      "Transportation",
      "Total Cash",
      "Shop",
    ];

    const rows = filteredBillHistory.map((b) => [
      new Date(b.pdfDate).toLocaleDateString(),
      b.totalSale,
      b.upiPayment,
      b.discount,
      b.totalDesiSale,
      b.totalBeerSale,
      b.breakageCash,
      b.canteenCash,
      b.salary,
      b.rateDiff,
      b.rent,
      b.transportation,
      b.totalPaymentReceived,
      b.shop,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const filename = `bill-history-${fromMonth}-to-${toMonth}-${
      shop || "all"
    }.csv`;

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /* ───────────────── PDF (all rows) ─────────────── */
  const exportPDF = () => {
    if (!filteredBillHistory.length) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    /* font */
    doc.addFileToVFS("Roboto-Regular.ttf", robotoRegularBase64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    /* header */
    doc.setFontSize(16);
    doc.text("Bill History Report", doc.internal.pageSize.getWidth() / 2, 15, {
      align: "center",
    });

    doc.setFontSize(12);
    const sub = `Period: ${fromMonth || "All"} → ${toMonth || "All"}${
      shop ? ` | Shop: ${shop}` : ""
    }`;
    doc.text(sub, doc.internal.pageSize.getWidth() / 2, 23, { align: "center" });

    /* summary */
    doc.setFontSize(10);
    doc.text(`Total Records: ${filteredBillHistory.length}`, 10, 32);
    doc.text(`Total Cash: ${formatCurrency(totalCash)}`, 10, 38);

    /* table data */
    const tableRows = filteredBillHistory.map((b) => [
      new Date(b.pdfDate).toLocaleDateString(),
      formatCurrency(b.totalSale),
      formatCurrency(b.upiPayment),
      formatCurrency(b.discount),
      formatCurrency(b.totalDesiSale),
      formatCurrency(b.totalBeerSale),
      formatCurrency(b.breakageCash),
      formatCurrency(b.canteenCash),
      formatCurrency(b.salary),
      formatCurrency(b.rateDiff),
      formatCurrency(b.rent),
      formatCurrency(b.transportation),
      formatCurrency(b.totalPaymentReceived),
      b.shop,
    ]);

    autoTable(doc, {
      startY: 45,
      head: [
        [
          "Date",
          "Total Sales",
          "UPI",
          "Discount",
          "Desi",
          "Beer",
          "Breakage",
          "Canteen",
          "Salary",
          "Rate Diff",
          "Rent",
          "Transport",
          "Total",
          "Shop",
        ],
      ],
      body: tableRows,
      tableWidth: "wrap",
      margin: { left: 10, right: 10 },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202], halign: "center" },
      columnStyles: {
        0: { cellWidth: 18, halign: "left" },
        1: { cellWidth: 22, halign: "right" },
        2: { cellWidth: 20, halign: "right" },
        3: { cellWidth: 20, halign: "right" },
        4: { cellWidth: 18, halign: "right" },
        5: { cellWidth: 18, halign: "right" },
        6: { cellWidth: 20, halign: "right" },
        7: { cellWidth: 20, halign: "right" },
        8: { cellWidth: 18, halign: "right" },
        9: { cellWidth: 20, halign: "right" },
        10: { cellWidth: 18, halign: "right" },
        11: { cellWidth: 24, halign: "right" },
        12: { cellWidth: 24, halign: "right" },
        13: { cellWidth: 20, halign: "left" },
      },
      didDrawPage: ({ pageNumber, pageCount }) => {
        doc.setFontSize(10);
        doc.text(
          `Page ${pageNumber} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      },
    });

    /* totals */
    const totals = filteredBillHistory.reduce(
      (acc, b) => ({
        totalSale: acc.totalSale + (b.totalSale || 0),
        upiPayment: acc.upiPayment + (b.upiPayment || 0),
        discount: acc.discount + (b.discount || 0),
        totalDesiSale: acc.totalDesiSale + (b.totalDesiSale || 0),
        totalBeerSale: acc.totalBeerSale + (b.totalBeerSale || 0),
        breakageCash: acc.breakageCash + (b.breakageCash || 0),
        canteenCash: acc.canteenCash + (b.canteenCash || 0),
        salary: acc.salary + (b.salary || 0),
        rateDiff: acc.rateDiff + (b.rateDiff || 0),
        rent: acc.rent + (b.rent || 0),
        transportation: acc.transportation + (b.transportation || 0),
        totalPaymentReceived:
          acc.totalPaymentReceived + (b.totalPaymentReceived || 0),
      }),
      {
        totalSale: 0,
        upiPayment: 0,
        discount: 0,
        totalDesiSale: 0,
        totalBeerSale: 0,
        breakageCash: 0,
        canteenCash: 0,
        salary: 0,
        rateDiff: 0,
        rent: 0,
        transportation: 0,
        totalPaymentReceived: 0,
      }
    );

    let y = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(11);
    doc.text("Summary Totals:", 10, y);
    doc.setFontSize(9);
    y += 6;
    Object.entries(totals).forEach(([k, v]) => {
      const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
      doc.text(`${label}: ${formatCurrency(v)}`, 10, y);
      y += 5;
    });

    const file = `bill-history-${fromMonth}-to-${toMonth}-${shop || "all"}.pdf`;
    doc.save(file);
  };

  /* ───────────────── invoice (single row) ───────── */
  const downloadInvoice = (bill) => {
    const doc = new jsPDF();
    doc.addFileToVFS("Roboto-Regular.ttf", robotoRegularBase64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    doc.setFontSize(16);
    doc.text("Om Ganeshay Namah", doc.internal.pageSize.getWidth() / 2, 10, {
      align: "center",
    });
    doc.setFontSize(14);
    doc.text(`Shop Name: ${bill.shop}`, doc.internal.pageSize.getWidth() / 2, 20, {
      align: "center",
    });

    doc.setFontSize(12);
    const startY = 30;
    doc.text(`Invoice Number: ${bill._id}`, 10, startY);
    doc.text(`Date: ${new Date(bill.pdfDate).toLocaleDateString()}`, 150, startY);

    if (bill.updatedStocks?.length) {
      autoTable(doc, {
        startY: startY + 10,
        head: [
          [
            "Product",
            "Size",
            "Open Stock",
            "Closing Stock",
            "Qty Sold",
            "Price",
            "Total Sale (₹)",
          ],
        ],
        body: bill.updatedStocks.map((s) => [
          s.product,
          s.size,
          s.lastQuantity,
          s.newQuantity,
          s.lastQuantity - s.newQuantity,
          s.price,
          ((s.lastQuantity - s.newQuantity) * s.price).toFixed(2),
        ]),
        styles: { fontSize: 9, cellPadding: 2 },
      });
    }

    let y = (doc.lastAutoTable?.finalY || startY + 20) + 10;
    const footer = [
      ["Total Sales", bill.totalSale],
      ["UPI Payment", bill.upiPayment],
      ["Discount", bill.discount],
      ["Desi Sales", bill.totalDesiSale],
      ["Beer Sales", bill.totalBeerSale],
      ["Breakage Cash", bill.breakageCash],
      ["Canteen Cash", bill.canteenCash],
      ["Salary", bill.salary],
      ["Rate Diff", bill.rateDiff],
      ["Rent", bill.rent],
      ["Transportation", bill.transportation],
      ["Total Cash", bill.totalPaymentReceived],
    ];

    doc.setFontSize(10);
    footer.forEach(([label, val]) => {
      doc.text(`${label}: ${formatCurrency(val || 0)}`, 10, y);
      y += 6;
    });

    doc.save(`invoice-${bill._id}.pdf`);
  };

  /* ──────────────────── UI ──────────────────────── */
  return (
    <div className="p-6 bg-blue-300 min-h-screen text-gray-900">
      <div className="max-w-full mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl mb-6 text-center font-semibold">Bill History</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* ─────────────── Filters ─────────────── */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-lg font-medium">From Month</label>
              <input
                type="month"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 text-lg font-medium">To Month</label>
              <input
                type="month"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 text-lg font-medium">Shop</label>
              <select
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="">All Shops</option>
                <option value="Vamanpui">Vamanpui</option>
                <option value="Amariya">Amariya</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={exportPDF}
                disabled={loading || !filteredBillHistory.length}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded w-1/2"
              >
                Export PDF
              </button>
              <button
                onClick={exportCSV}
                disabled={loading || !filteredBillHistory.length}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded w-1/2"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              Records: <strong>{filteredBillHistory.length}</strong>
            </span>
            <span>
              Total Cash: <strong>{formatCurrency(totalCash)}</strong>
            </span>
          </div>
        </div>

        {/* ─────────────── Table ─────────────── */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
            <p className="mt-2">Loading…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border-collapse shadow-md text-sm md:text-base">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  {[
                    "Date",
                    "Total Sales",
                    "UPI Payment",
                    "Discount",
                    "Desi Sales",
                    "Beer Sales",
                    "Breakage Cash",
                    "Canteen Cash",
                    "Salary",
                    "Rate Diff",
                    "Rent",
                    "Transportation",
                    "Total Cash",
                    "Shop",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="py-2 px-4 border text-right first:text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredBillHistory.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="py-8 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredBillHistory.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border text-left">
                        {new Date(b.pdfDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.totalSale)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.upiPayment)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.discount)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.totalDesiSale)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.totalBeerSale)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.breakageCash)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.canteenCash)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.salary)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.rateDiff)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.rent)}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {formatCurrency(b.transportation)}
                      </td>
                      <td className="py-2 px-4 border text-right font-semibold">
                        {formatCurrency(b.totalPaymentReceived)}
                      </td>
                      <td className="py-2 px-4 border text-center">{b.shop}</td>
                      <td className="py-2 px-4 border text-center">
                        <button
                          onClick={() => downloadInvoice(b)}
                          title="Download Invoice"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ⬇
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
