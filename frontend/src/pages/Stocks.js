import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { AuthContext } from "../context/AuthContext";
import { robotoRegularBase64 } from "./fonts"; // Adjust the path as necessary

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [totalSale, setTotalSale] = useState(0);
  const [newQuantities, setNewQuantities] = useState({});
  const [upiPayment, setUpiPayment] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [canteenCash, setCanteenCash] = useState(0);
  const [breakageCash, setBreakageCash] = useState(0);
  const [rateDiff, setRateDiff] = useState(0);
  const [transportation, setTransportation] = useState(0);
  const [rent, setRent] = useState(0);
  const [salary, setSalary] = useState(0);
  const [shop, setShop] = useState("Vamanpui");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [summaryModalIsOpen, setSummaryModalIsOpen] = useState(false);
  const [totalDesiSale, setTotalDesiSale] = useState(0);
  const [totalBeerSale, setTotalBeerSale] = useState(0);
  const { user, loading: userLoading } = useContext(AuthContext);
  const [pdfDate, setPdfDate] = useState(new Date().toISOString().substring(0, 10));

  useEffect(() => {
    const fetchStocks = async () => {
      if (userLoading) return;

      setLoading(true);
      try {
        if (!user || !user.token) {
          throw new Error("User not authenticated");
        }
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/stocks?shop=${shop}`);
        const fetchedStocks = res.data.map((stock) => ({
          ...stock,
          lastQuantity: stock.quantity,
        }));
        setStocks(fetchedStocks);
        setTotalSale(0);
        setUpiPayment(0);
        setDiscount(0);
        setCanteenCash(0);
        setBreakageCash(0);
        setSalary(0);
        setRent(0);
        setRateDiff(0);
        setTransportation(0);
        setNewQuantities({});
      } catch (error) {
        setError("Error fetching stocks");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [user, userLoading, shop]);

  useEffect(() => {
    const calculateTotals = () => {
      let totalSales = 0;
      let desiSales = 0;
      let beerSales = 0;

      stocks.forEach((stock) => {
        const newQuantity = newQuantities[stock._id] !== undefined ? Number(newQuantities[stock._id]) : stock.lastQuantity;
        if (isNaN(newQuantity)) return;

        const soldQuantity = stock.lastQuantity - newQuantity;
        const saleAmount = soldQuantity * stock.price;
        totalSales += saleAmount;

        if (stock.product.toLowerCase().includes("desi")) {
          desiSales += saleAmount;
        } else {
          beerSales += saleAmount;
        }
      });

      setTotalSale(totalSales);
      setTotalDesiSale(desiSales);
      setTotalBeerSale(beerSales);
    };

    calculateTotals();
  }, [newQuantities, stocks]);

  const onConfirmUpdate = () => {
    setSummaryModalIsOpen(true);
    setModalIsOpen(false);
  };
  const onUpdateStocks = async () => {
    setLoading(true);

    try {

      const updatedStocks = await Promise.all(

        stocks.map(async (stock) => {
          const newQuantity = newQuantities[stock._id] !== undefined ? Number(newQuantities[stock._id]) : stock.lastQuantity;
          if (isNaN(newQuantity)) return stock;

          const res = await axios.put(
            `${process.env.REACT_APP_API_URL}/stocks/${stock._id}`,
            { quantity: newQuantity }
          );

          return { ...res.data, lastQuantity: stock.lastQuantity, soldQuantity: stock.lastQuantity - newQuantity };
        })
      );
      setStocks(updatedStocks);

      await generateInvoice(updatedStocks);
      // Send data to backend to store in bill history
      const totalPaymentReceived = totalSale + canteenCash - breakageCash - discount - salary - upiPayment - rent + rateDiff-transportation;
      await axios.post(`${process.env.REACT_APP_API_URL}/billHistory`, {
        updatedStocks,
        pdfDate,
        totalSale,
        upiPayment,
        discount,
        breakageCash,
        canteenCash,
        totalDesiSale,
        totalBeerSale,
        salary,
        rateDiff,
        rent,
        transportation,
        shop,
        totalPaymentReceived
      });

      setError("");
    } catch (error) {
      setError("Error updating stocks");
      console.error(error);
    } finally {
      setLoading(false);
      setSummaryModalIsOpen(false); // Close the modal after updating
    }
  };
  const generateInvoice = async (stocks) => {
    const doc = new jsPDF();
    const invoiceDate = new Date(pdfDate).toLocaleString(); // Properly format invoice date

    const now = new Date(); // Create a new Date object
    const datePart = now.toISOString().split("T")[0].replace(/-/g, ""); // Generate date part

    const totalPaymentReceived = totalSale + canteenCash - breakageCash - discount - salary - upiPayment - rent + rateDiff-transportation;

    const invoiceNumber = `Inv-${datePart}`; // Dynamic invoice number

    // Add the Roboto font
    doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

    // Use the Roboto font
    doc.setFont('Roboto');

    doc.setFontSize(16);
    doc.text("Om Ganeshay Namah", doc.internal.pageSize.getWidth() / 2, 10, {
      align: "center",
    });
    doc.setFontSize(14);
    doc.text(`Shop Name : ${shop}`, doc.internal.pageSize.getWidth() / 2, 20, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${invoiceNumber}`, 14, 30);
    doc.text(`Date: ${invoiceDate}`, 14, 40);

    autoTable(doc, {
      startY: 50,
      head: [
        [
          "Product",
          "Size",
          "Open Stock",
          "Closing Stock",
          "Quantity Sold",
          "Price",
          "Total Sale (₹)",
        ],
      ],
      body: stocks.map((stock) => [
        stock.product,
        stock.size,
        stock.lastQuantity,
        stock.quantity,
        stock.lastQuantity - stock.quantity,
        stock.price,
        ((stock.lastQuantity - stock.quantity) * stock.price).toFixed(2),
      ]),
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.height;
        const finalY = data.cursor.y;
        const margin = 10;

        if (finalY + margin > pageHeight) {
          doc.addPage();
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    const addTextWithNewPage = (text, y) => {
      const pageHeight = doc.internal.pageSize.height;
      if (y > pageHeight - 10) {
        doc.addPage();
        y = 10; // Reset y position for the new page
      }
      doc.text(text, 14, y);
      return y + 10; // Increment y position for the next line
    };

    let yPosition = finalY;
    yPosition = addTextWithNewPage(`Total Payment: ₹${totalSale.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Total Discount: ₹${discount.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Total Salary: ₹${salary.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Total UPI Payment: ₹${upiPayment.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Canteen Cash: ₹${canteenCash.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Breakage Cash: ₹${breakageCash.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Rate Diff : ₹${rateDiff.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Rent : ₹${rent.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Transportation : ₹${transportation.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Total Cash: ₹${totalPaymentReceived.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Total Desi Sale: ₹${totalDesiSale.toFixed(2)}`, yPosition);
    yPosition = addTextWithNewPage(`Total Beer Sale: ₹${totalBeerSale.toFixed(2)}`, yPosition);

    const pdfBlob = doc.output("blob");

    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, `invoice_${new Date().toISOString()}.pdf`);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/invoices`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      setError("Error saving invoice");
      console.error(error);
    }

    doc.save(`Invoice-${invoiceDate}.pdf`); // Save with dynamic invoice number
  };



  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const closeSummaryModal = () => {
    setSummaryModalIsOpen(false);
  };

  return (
    <div className="p-6 bg-blue-300 min-h-screen text-gray-900">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <nav className="mb-4 flex justify-center space-x-4">
          <button
            onClick={() => setShop("Vamanpui")}
            className={`p-2 rounded ${shop === "Vamanpui" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Vamanpui
          </button>
          <button
            onClick={() => setShop("Amariya")}
            className={`p-2 rounded ${shop === "Amariya" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Amariya
          </button>
        </nav>
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Stock Management ({shop})
        </h1>
        <div className="flex flex-row align-middle items-center">
          <label className="block mb-2 m-2 ">Select Date:</label>
          <input
            type="date"
            value={pdfDate}
            onChange={(e) => setPdfDate(e.target.value)}
            className="border p-2 rounded m-2"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Product</th>
                <th className="px-4 py-2 border">Size</th>
                <th className="px-4 py-2 border">Opening Stock</th>
                <th className="px-4 py-2 border">Closing Stock</th>
                <th className="px-4 py-2 border">Sold Quantity</th>
                <th className="px-4 py-2 border">Price (₹)</th>
                <th className="px-4 py-2 border">Total Sale (₹)</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const newQuantity = newQuantities[stock._id] !== undefined ? newQuantities[stock._id] : stock.lastQuantity;
                const soldQuantity = stock.lastQuantity - newQuantity;
                const totalSaleAmount = soldQuantity * stock.price;

                return (
                  <tr key={stock._id}>
                    <td className="border px-4 py-2">{stock.product}</td>
                    <td className="border px-4 py-2">{stock.size}</td>
                    <td className="border px-4 py-2">{stock.lastQuantity}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="number"
                        placeholder="New Quantity"
                        onChange={(e) =>
                          setNewQuantities({
                            ...newQuantities,
                            [stock._id]: e.target.value === "" ? stock.lastQuantity : Number(e.target.value),
                          })
                        }
                        onWheel={(e) => e.preventDefault()}
                        onKeyDown={(e) => e.key === 'ArrowUp' || e.key === 'ArrowDown' ? e.preventDefault() : null}
                        className="w-full border px-2 py-1"
                      />
                    </td>
                    <td className="border px-4 py-2">{soldQuantity}</td>
                    <td className="border px-4 py-2">{stock.price}</td>
                    <td className="border px-4 py-2">
                      ₹{totalSaleAmount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <button
            onClick={openModal}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Update Stocks
          </button>
        </div>

        {modalIsOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md w-1/2">
              <div className="flex justify-between mt-4">
                <div className="bg-gray-200 p-4 rounded shadow w-1/2 mr-4">
                  <p className="font-semibold">Total Sale: ₹{totalSale.toFixed(2)}</p>
                  <p className="font-semibold">UPI Payment: <span className="text-red-500">₹{upiPayment.toFixed(2)}</span></p>
                  <p className="font-semibold">Miscellaneous Expense: <span className="text-red-500">₹{discount.toFixed(2)}</span></p>
                  <p className="font-semibold">Canteen Cash: <span className="text-green-500">₹{canteenCash.toFixed(2)}</span></p>
                  <p className="font-semibold">Rate Diff Cash: <span className="text-green-500">₹{rateDiff.toFixed(2)}</span></p>
                  <p className="font-semibold">Breakage Cash: <span className="text-red-500">₹{breakageCash.toFixed(2)}</span></p>
                  <p className="font-semibold">Rent: <span className="text-red-500">₹{rent.toFixed(2)}</span></p>
                  <p className="font-semibold">Transportation: <span className="text-red-500">₹{transportation.toFixed(2)}</span></p>
                  <p className="font-semibold">Salary: <span className="text-red-500">₹{salary.toFixed(2)}</span></p>
                  <p className="font-semibold">Total Cash : ₹{(totalSale + canteenCash - breakageCash - discount - salary - upiPayment - rent + rateDiff-transportation).toFixed(2)}</p>
                  <p className="font-semibold"> Total Desi Sale: ₹{totalDesiSale.toFixed(2)}</p>
                  <p className="font-semibold"> Total Beer Sale: ₹{totalBeerSale.toFixed(2)}</p>




                </div>
                <div className="bg-gray-200 p-4 rounded shadow w-1/2">
                  <label className="block mb-2">Discount (₹):</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="border p-2 w-full rounded"
                    onWheel={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.key === 'ArrowUp' || e.key === 'ArrowDown' ? e.preventDefault() : null}
                  />
                  <label className="block mb-2 mt-2">Salary (₹):</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="border p-2 w-full rounded"
                    onWheel={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.key === 'ArrowUp' || e.key === 'ArrowDown' ? e.preventDefault() : null}
                  />
                  <label className="block mb-2 mt-2">UPI Payment (₹):</label>
                  <input
                    type="number"
                    value={upiPayment}
                    onChange={(e) => setUpiPayment(Number(e.target.value))}
                    className="border p-2 w-full rounded"
                    onWheel={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.key === 'ArrowUp' || e.key === 'ArrowDown' ? e.preventDefault() : null}
                  />
                  <label className="block mb-2 mt-2">Canteen Cash (₹):</label>
                  <input
                    type="number"
                    value={canteenCash}
                    onChange={(e) => setCanteenCash(Number(e.target.value))}
                    className="border p-2 w-full rounded"
                    onWheel={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.key === 'ArrowUp' || e.key === 'ArrowDown' ? e.preventDefault() : null}
                  />
                  <label className="block mb-2 mt-2">Breakage Cash (₹):</label>
                  <input
                    type="number"
                    value={breakageCash}
                    onChange={(e) => setBreakageCash(Number(e.target.value))}
                    className="border p-2 w-full rounded"
                    onWheel={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.key === 'ArrowUp' || e.key === 'ArrowDown' ? e.preventDefault() : null}
                  />
                  <label className="block mb-2 mt-2">Rate Diffrence (₹):</label>
                  <input
                    type="number"
                    value={rateDiff}
                    onChange={(e) => setRateDiff(Number(e.target.value))}
                    className="border p-2 w-full rounded"
                    onWheel={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.key === 'ArrowUp' || e.key === 'ArrowDown' ? e.preventDefault() : null}
                  />

                  <label className="block mb-2 mt-2">transportation Expense (₹):</label>
                  <input
                    type="number"
                    value={transportation}
                    onChange={(e) => setTransportation(Number(e.target.value))}
                    className="border p-2 w-full rounded"
                    onWheel={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.key === 'ArrowUp' || e.key === 'ArrowDown' ? e.preventDefault() : null}
                  />


                  <label className="block mb-2 mt-2">Rent (₹):</label>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(Number(e.target.value))}
                    className="border p-2 w-full rounded"
                    onWheel={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.key === 'ArrowUp' || e.key === 'ArrowDown' ? e.preventDefault() : null}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={closeModal}
                  className="bg-gray-300 py-2 px-6 rounded-md text-lg font-medium mr-4 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmUpdate}
                  className="bg-blue-500 text-white py-2 px-6 rounded-md text-lg font-medium hover:bg-blue-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {summaryModalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to update the stocks?
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={closeSummaryModal}
                className="bg-gray-300 py-2 px-6 rounded-md text-lg font-medium mr-4 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={onUpdateStocks}
                className="bg-blue-500 text-white py-2 px-6 rounded-md text-lg font-medium hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Loading...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;
