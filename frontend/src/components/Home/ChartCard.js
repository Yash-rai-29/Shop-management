import React from "react";
import ReactApexChart from "react-apexcharts";

const ChartCard = ({ title, options, series, type, height }) => (
  <div className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-indigo-900 p-4 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md m-3" style={{ width: "48%" }}>
    <h2 className="text-xl font-bold text-white mb-2 text-center">{title}</h2>
    <ReactApexChart options={options} series={series} type={type} height={height} />
  </div>
);

export default ChartCard;
