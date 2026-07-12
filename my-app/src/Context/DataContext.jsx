import axios from "axios";
import { createContext, useState, useCallback } from "react";
import { API_BASE } from "../config/api.js";

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState();

  // fetching all products from api
  const FetchingAllProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      try {
        const fallback = await axios.get("https://fakestoreapi.com/products");
        setData(Array.isArray(fallback.data) ? fallback.data : []);
        console.warn("Using FakeStore fallback — is the API running?", API_BASE);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);
  const getUniqueCategory = (data, property) => {
    const list = Array.isArray(data) ? data : [];
    const values = list.map((item) => item[property]).filter((v) => v != null && v !== "");
    return ["All", ...new Set(values)];
  };
  const categoryOnlyData = getUniqueCategory(data, "category");
  // const brandOnlyData = getUniqueCategory(data, "brand");
  return (
    <DataContext.Provider
      value={{
        data,
        setData,
        FetchingAllProducts,
        categoryOnlyData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
export default DataContext;
