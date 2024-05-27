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
  const [shop, setShop] = useState("Vamanpui");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { user, loading: userLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchStocks = async () => {
      if (userLoading) return;

      setLoading(true);
      try {
        if (!user || !user.token) {
          throw new Error("User not authenticated");
        }
        const res = await axios.get(`http://localhost:5000/api/stocks?shop=${shop}`);
        const fetchedStocks = res.data.map((stock) => ({
          ...stock,
          lastQuantity: stock.quantity,
        }));
        setStocks(fetchedStocks);
        setTotalSale(0);
        setUpiPayment(0);
        setDiscount(0);
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

  const onUpdateStocks = async () => {
    let totalSales = 0;
    setLoading(true);

    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          const newQuantity = Number(newQuantities[stock._id]);
          if (isNaN(newQuantity)) return stock;

          const lastQuantity = stock.quantity;
          const res = await axios.put(
            `http://localhost:5000/api/stocks/${stock._id}`,
            { quantity: newQuantity }
          );
          totalSales += (lastQuantity - newQuantity) * stock.price;
          return { ...res.data, lastQuantity };
        })
      );
      setStocks(updatedStocks);
      setTotalSale(totalSales);
      await generateInvoice(updatedStocks, totalSales, upiPayment, discount);
      setError("");
    } catch (error) {
      setError("Error updating stocks");
      console.error(error);
    } finally {
      setLoading(false);
      setModalIsOpen(false); // Close the modal after updating
    }
  };

  const generateInvoice = async (stocks, totalSale, upiPayment, discount) => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();
    const totalPaymentReceived = totalSale - discount - upiPayment;
    const invoiceNumber = `INV-${Date.now()}`; // Dynamic invoice number

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
    doc.text(`Date: ${currentDate}`, 14, 40);

    autoTable(doc, {
      startY: 50,
      head: [
        [
          "Product",
          "Size",
          "Last Quantity",
          "Updated Quantity",
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
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Payment: ₹${totalSale.toFixed(2)}`, 14, finalY);
    doc.text(`Total Discount: ₹${discount.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total UPI Payment: ₹${upiPayment.toFixed(2)}`, 14, finalY + 20);
    doc.text(
      `Total Sale: ₹${totalPaymentReceived.toFixed(2)}`,
      14,
      finalY + 30
    );

    const pdfBlob = doc.output("blob");

    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, `invoice_${new Date().toISOString()}.pdf`);

      await axios.post(
        "http://localhost:5000/api/invoices",
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

    doc.save(`invoice_${currentDate}.pdf`);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-900">
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
        <h2 className="text-3xl mb-6 text-center font-semibold">Stocks - {shop}</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
      
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border">Product</th>
                  <th className="py-2 px-4 border">Size</th>
                  <th className="py-2 px-4 border">Quantity</th>
                  <th className="py-2 px-4 border">Price</th>
                  <th className="py-2 px-4 border">New Quantity</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock._id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border">{stock.product}</td>
                    <td className="py-2 px-4 border">{stock.size}</td>
                    <td className="py-2 px-4 border">{stock.quantity}</td>
                    <td className="py-2 px-4 border">{stock.price}</td>
                    <td className="py-2 px-4 border">
                      <input
                        type="number"
                        placeholder="New Quantity"
                        className="border p-2 rounded w-full"
                        onChange={(e) =>
                          setNewQuantities({
                            ...newQuantities,
                            [stock._id]: e.target.value,
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-between items-end">
          <div className="mb-2 w-full md:w-auto md:mr-2">
            <label htmlFor="upiPayment" className="block mb-1">
              UPI Payment
            </label>
            <input
              type="number"
              id="upiPayment"
              value={upiPayment}
              onChange={(e) => setUpiPayment(Number(e.target.value))}
              placeholder="Enter UPI Payment"
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="mb-2 w-full md:w-auto md:mr-2">
            <label htmlFor="discount" className="block mb-1">
              Discount
            </label>
            <input
              type="number"
              id="discount"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="Enter Discount"
              className="border p-2 w-full rounded"
            />
          </div>
          <button
            onClick={openModal}
            className="bg-green-500 text-white p-2 rounded w-full md:w-auto"
          >
            Update All Stocks
          </button>
        </div>

        {totalSale !== 0 && (
          <div className="mt-6">
            <div className="text-lg font-semibold text-green-600">Summary</div>
            <div className="mt-2">UPI Amount: ₹{upiPayment.toFixed(2)}</div>
            <div className="mt-2">Discount Amount: ₹{discount.toFixed(2)}</div>
            <div className="mt-4 text-green-500">
              Total Sale: ₹{totalSale.toFixed(2)}
            </div>
            <div className="mt-2">
              Remaining Amount: ₹{(totalSale - upiPayment - discount).toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Update</h2>
            <p>Are you sure you want to update the stock quantities?</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="mr-2 bg-gray-500 text-white p-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={onUpdateStocks}
                className="bg-green-500 text-white p-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;
