import React from "react";

const Filter = ({ selectedShop, handleShopChange, dateFilter, handleDateFilterChange, dateValue, handleDateValueChange, handleClearFilters }) => (
  <div className="ml-auto flex space-x-2">
    <select onChange={handleShopChange} value={selectedShop} className="p-2 border rounded bg-white hover:shadow-md focus:outline-none">
      <option value="">All Shops</option>
      {/* Map through unique shops */}
    </select>
    <select onChange={handleDateFilterChange} value={dateFilter} className="p-2 border rounded bg-white hover:shadow-md focus:outline-none">
      <option value="date">Date</option>
      <option value="month">Month</option>
      <option value="year">Year</option>
      <option value="week">Week</option>
    </select>
    <input type={getDateInputType(dateFilter)} onChange={handleDateValueChange} value={dateValue} className="p-2 border rounded bg-white hover:shadow-md focus:outline-none" />
    <button onClick={handleClearFilters} className="p-2 border rounded bg-white hover:shadow-md focus:outline-none">
      Clear Filters
    </button>
  </div>
);

const getDateInputType = (filterType) => {
  switch (filterType) {
    case "month":
      return "month";
    case "year":
      return "year";
    default:
      return "date";
  }
};

export default Filter;
