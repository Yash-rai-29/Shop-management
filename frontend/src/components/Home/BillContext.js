import React, { createContext, useState, useEffect } from "react";
import axios from "axios"; // Import axios for making API requests

export const BillContext = createContext();

const BillProvider = ({ children }) => {
  const [billHistory, setBillHistory] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    // Fetch bill history data from API
    const fetchBillHistory = async () => {
      try {
        const response = await axios.get("/api/billHistory"); // Replace with your API endpoint
        setBillHistory(response.data);
      } catch (error) {
        console.error("Error fetching bill history data:", error);
      }
    };

    // Fetch records data from API
    const fetchRecords = async () => {
      try {
        const response = await axios.get("/api/records"); // Replace with your API endpoint
        setRecords(response.data);
      } catch (error) {
        console.error("Error fetching records data:", error);
      }
    };

    fetchBillHistory();
    fetchRecords();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <BillContext.Provider value={{ billHistory, records }}>
      {children}
    </BillContext.Provider>
  );
};

export default BillProvider;
