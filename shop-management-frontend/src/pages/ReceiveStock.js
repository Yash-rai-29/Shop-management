import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const ReceiveStock = () => {
  const [stocks, setStocks] = useState([]);
  const [shop, setShop] = useState("Vamanpui");
  const [newStock, setNewStock] = useState({
    product: "",
    size: "",
    quantity: 0,
    price: 0,
  });
  const [error, setError] = useState("");
  const [updatedQuantities, setUpdatedQuantities] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { user, loading: userLoading } = useContext(AuthContext);

  const fetchStocks = async () => {
    if (userLoading) return;

    try {
      if (!user || !user.token) {
        throw new Error("User not authenticated");
      }
      const res = await axios.get(`https://shop-management-im3g.onrender.com/api/stocks?shop=${shop}`);
      setStocks(res.data);
    } catch (error) {
      setError("Error fetching stocks");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [user, userLoading, shop]);

  const onAddStock = async () => {
    if (!newStock.product || !newStock.size || newStock.quantity <= 0 || newStock.price <= 0) {
      setError("Please fill out all fields with valid values.");
      return;
    }

    try {
      const res = await axios.post("https://shop-management-im3g.onrender.com/api/stocks", {
        ...newStock,
        shop,
      });
      setError("");
      alert("Stock added successfully");
      setNewStock({ product: "", size: "", quantity: 0, price: 0 });
      await fetchStocks();
    } catch (error) {
      setError("Error adding stock");
      console.error(error);
    }
  };

  const handleQuantityChange = (id, quantity) => {
    setUpdatedQuantities({
      ...updatedQuantities,
      [id]: quantity,
    });
  };

  const onDeleteStock = async (id) => {
    try {
      await axios.delete(`https://shop-management-im3g.onrender.com/api/stocks/${id}`);
      setStocks(stocks.filter((stock) => stock._id !== id));
      setError("");
    } catch (error) {
      setError("Error deleting stock");
      console.error(error);
    }
  };

  const onUpdateQuantities = async () => {
    try {
      await Promise.all(
        Object.keys(updatedQuantities).map((id) =>
          axios.put(`https://shop-management-im3g.onrender.com/api/stocks/${id}`, {
            quantity: updatedQuantities[id],
          })
        )
      );
      setError("");
      alert("Quantities updated successfully");
      setUpdatedQuantities({});
      await fetchStocks();
    } catch (error) {
      setError("Error updating quantities");
      console.error(error);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = () => {
    onDeleteStock(deleteId);
    setShowModal(false);
    setDeleteId(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl mb-6 text-center font-semibold text-gray-700">Receive Stock</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-6">
          <label className="block mb-2 text-gray-600">Select Shop:</label>
          <select
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="Vamanpui">Vamanpui</option>
            <option value="Amariya">Amariya</option>
          </select>
        </div>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-5 border-b text-left">Product</th>
                <th className="py-3 px-5 border-b text-left">Size</th>
                <th className="py-3 px-5 border-b text-left">Available Quantity</th>
                <th className="py-3 px-5 border-b text-left">Price</th>
                <th className="py-3 px-5 border-b text-left">New Quantity</th>
                <th className="py-3 px-5 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock._id} className="hover:bg-gray-100">
                  <td className="py-3 px-5 border-b">{stock.product}</td>
                  <td className="py-3 px-5 border-b">{stock.size}</td>
                  <td className="py-3 px-5 border-b">{stock.quantity}</td>
                  <td className="py-3 px-5 border-b"> ₹{stock.price}</td>
                  <td className="py-3 px-5 border-b">
                    <input
                      type="number"
                      value={updatedQuantities[stock._id] || stock.quantity}
                      onChange={(e) => handleQuantityChange(stock._id, Number(e.target.value))}
                      className="border p-2 w-full rounded"
                    />
                  </td>
                  <td className="py-3 px-5 border-b">
                    <button
                      onClick={() => confirmDelete(stock._id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={onUpdateQuantities}
          className="bg-green-500 text-white p-2 mt-4 w-full rounded hover:bg-green-600"
        >
          Update Quantities
        </button>
        <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl mb-4 text-gray-700 font-semibold">Add New Stock</h3>
          <div className="mb-4">
            <label className="block mb-2 text-gray-600">Product:</label>
            <input
              type="text"
              value={newStock.product}
              onChange={(e) => setNewStock({ ...newStock, product: e.target.value })}
              className="border p-2 w-full rounded"
              placeholder="Enter product name"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-600">Size:</label>
            <input
              type="text"
              value={newStock.size}
              onChange={(e) => setNewStock({ ...newStock, size: e.target.value })}
              className="border p-2 w-full rounded"
              placeholder="Enter size"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-600">Quantity:</label>
            <input
              type="number"
              value={newStock.quantity}
              onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })}
              className="border p-2 w-full rounded"
              placeholder="Enter quantity"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-600">Price:</label>
            <input
              type="number"
              value={newStock.price}
              onChange={(e) => setNewStock({ ...newStock, price: Number(e.target.value) })}
              className="border p-2 w-full rounded"
              placeholder="Enter price"
            />
          </div>
          <button
            onClick={onAddStock}
            className="bg-blue-500 text-white p-2 mt-4 w-full rounded hover:bg-blue-600"
          >
            Add Stock
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg mb-4">Are you sure you want to delete this stock?</h3>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white p-2 mr-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiveStock;
