
import React from 'react';

// Utility function to format date from ISO format to DD/MM/YY
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero indexed
  const year = date.getFullYear().toString().slice(-2); // Get last two digits of year
  return `${day}/${month}/${year}`;
};

const Modal = ({ isOpen, onClose, title, data }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-md shadow-lg w-11/12 max-w-4xl mx-4 relative overflow-hidden transform transition-all duration-300">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900">
          ✖
        </button>
        <h2 className="text-2xl font-semibold mb-4 flex justify-center items-center">{title}</h2>
        <div className="overflow-y-auto max-h-96">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">Record Name</th>
                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">Shop Name</th>
                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">Message</th>
                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">Amount</th>
                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">Date</th>
                <th className="py-3 px-6 text-left bg-gray-100 border-b border-gray-200">Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, index) => (
                <tr key={index}>
                  <td className="py-3 px-6 border-b border-gray-200">{record.recordName}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{record.shopName}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{record.message}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{record.amount}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{formatDate(record.date)}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{record.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Modal;
