import React from "react";

const StatCard = ({ title, amount, bgColor, onClick }) => (
  <div
    className={`${bgColor} p-4 shadow-md hover:shadow-lg transition-shadow duration-300 h-28 flex-col justify-center items-center rounded-md w-52`}
    onClick={onClick}
  >
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-xl">₹ {amount}</p>
  </div>
);

export default StatCard;
