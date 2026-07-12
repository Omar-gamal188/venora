/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItem, setCartItem] = useState(() => {
    const storedCart = localStorage.getItem("cartItem");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItem", JSON.stringify(cartItem));
  }, [cartItem]);
  const addToCart = (product) => {
    const exists = cartItem.find((item) => item.id === product.id);
    if (exists) {
      setCartItem(
        cartItem.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
      toast.success("Quantity is increase");
    } else {
      setCartItem([...cartItem, { ...product, quantity: 1 }]);
      toast.success("Product added to cart");
    }
  };
  const updateQuantity = (productId, action) => {
    setCartItem((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            let newUnit = item.quantity;

            if (action === "increase") {
              newUnit = newUnit + 1;
              // toast.success("Quantity of Product is increase");
            }

            if (action === "decrease") {
              newUnit = newUnit - 1;
              // toast.success("Quantity of Product is decrease");
            }

            return newUnit > 0 ? { ...item, quantity: newUnit } : null;
          }

          return item;
        })
        .filter((item) => item !== null),
    );
  };
  const clearCart = () => {
    setCartItem([]);
  };
  return (
    <CartContext.Provider
      value={{ cartItem, setCartItem, addToCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);
