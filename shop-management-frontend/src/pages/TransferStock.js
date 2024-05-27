import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const TransferStock = () => {
  const [stocks, setStocks] = useState({});
  const [fromShop, setFromShop] = useState("Vamanpui");
  const [toShop, setToShop] = useState("Amariya");
  const [selectedStock, setSelectedStock] = useState(null);
  const [transferQuantity, setTransferQuantity] = useState(0);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { user, loading: userLoading } = useContext(AuthContext);

  const fetchStocks = async () => {
    if (userLoading) return;

    try {
      if (!user || !user.token) {
        throw new Error("User not authenticated");
      }
      const [fromRes, toRes] = await Promise.all([
        axios.get(`https://shop-management-im3g.onrender.com/api/stocks?shop=${fromShop}`),
        axios.get(`https://shop-management-im3g.onrender.com/api/stocks?shop=${toShop}`)
      ]);
      setStocks({
        [fromShop]: fromRes.data,
        [toShop]: toRes.data
      });
    } catch (error) {
      setError("Error fetching stocks");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [user, userLoading, fromShop, toShop]);

  const onTransferStock = async () => {
    if (!selectedStock || transferQuantity <= 0) {
      setError("Please select a stock and enter a valid transfer quantity.");
      return;
    }

    try {
      const res = await axios.post("https://shop-management-im3g.onrender.com/api/stocks/transfer", {
        stockId: selectedStock._id,
        fromShop,
        toShop,
        transferQuantity,
      });
      setError("");
      setShowModal(false);
      alert(res.data.msg);
      setTransferQuantity(0);
      setSelectedStock(null);
      // Refetch stocks after transfer
      await fetchStocks();
    } catch (error) {
      setError("Error transferring stock");
      console.error(error);
    }
  };

  const openModal = () => {
    if (!selectedStock || transferQuantity <= 0) {
      setError("Please select a stock and enter a valid transfer quantity.");
      return;
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl mb-6 text-center font-semibold">Transfer Stock</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">From Shop:</label>
            <select
              value={fromShop}
              onChange={(e) => setFromShop(e.target.value)}
              className="border p-2 w-full bg-gray-200 text-gray-800 rounded"
            >
              <option value="Vamanpui">Vamanpui</option>
              <option value="Amariya">Amariya</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">To Shop:</label>
            <select
              value={toShop}
              onChange={(e) => setToShop(e.target.value)}
              className="border p-2 w-full bg-gray-200 text-gray-800 rounded"
            >
              <option value="Amariya">Amariya</option>
              <option value="Vamanpui">Vamanpui</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-5 border-b text-left">Product</th>
                <th className="py-3 px-5 border-b text-left">Size</th>
                <th className="py-3 px-5 border-b text-left">Available Quantity</th>
                <th className="py-3 px-5 border-b text-left">Select</th>
              </tr>
            </thead>
            <tbody>
              {stocks[fromShop]?.map((stock) => (
                <tr key={stock._id} className="hover:bg-gray-100">
                  <td className="py-3 px-5 border-b">{stock.product}</td>
                  <td className="py-3 px-5 border-b">{stock.size}</td>
                  <td className="py-3 px-5 border-b">{stock.quantity}</td>
                  <td className="py-3 px-5 border-b text-center">
                    <input
                      type="radio"
                      name="selectedStock"
                      value={stock._id}
                      onChange={() => setSelectedStock(stock)}
                      className="form-radio text-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <label className="block mb-2">Transfer Quantity:</label>
          <input
            type="number"
            value={transferQuantity}
            onChange={(e) => setTransferQuantity(Number(e.target.value))}
            className="border p-2 w-full bg-gray-200 text-gray-800 rounded"
            placeholder="Enter quantity to transfer"
          />
        </div>
        <button
          onClick={openModal}
          className="bg-blue-500 text-white p-2 mt-4 w-full rounded hover:bg-blue-600"
        >
          Transfer Stock
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl mb-4">Confirm Transfer</h3>
              <p className="mb-4">
                Are you sure you want to transfer{" "}
                <strong>{transferQuantity}</strong> of{" "}
                <strong>{selectedStock?.product}</strong> from{" "}
                <strong>{fromShop}</strong> to <strong>{toShop}</strong>?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={onTransferStock}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferStock;
