import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";
import { DataProvider } from "./Context/DataContext.jsx";
import { CartProvider } from "./Context/CartContext.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import { HashRouter } from "react-router-dom";
import { OrderProvider } from "./Context/OrderContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DataProvider>
      <OrderProvider>
        <CartProvider>
          <AuthProvider>
            <HashRouter>
              <App />
              <Toaster position="top-center" reverseOrder={false} />
            </HashRouter>
          </AuthProvider>
        </CartProvider>
      </OrderProvider>
    </DataProvider>
  </StrictMode>,
);
