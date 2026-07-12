import { useContext, createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const OrderContext = createContext(null);
export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const data = localStorage.getItem("orders");
    return data ? JSON.parse(data) : [];
  });

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (NewOrder) => {
    setOrders((prev) => [...prev, NewOrder]);
    toast.success("Order placed successfully");
  };

  const delOrder = (id) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    toast.success("Order deleted");
  };

  const UpdateOrderStatus = (id, status) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order)),
    );

    toast.success("Order updated");
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        delOrder,
        UpdateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
export const useOrder = () => useContext(OrderContext);
