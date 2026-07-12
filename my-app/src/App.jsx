import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NavBar from "./Component/NavBar";
import About from "./pages/About";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import axios from "axios";
import Footer from "./Component/Footer";
import SinglePages from "./pages/SinglePages";
import { useEffect, useState, useRef } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NewUser from "./pages/NewUser";
import { AdminRoute, NewUserRoute } from "./Component/ProtectedRoute";
import Order from "./pages/Order";
import OrdersForCustomr from "./pages/OrdersForCustomr";

const App = () => {
  const [Location, setLocation] = useState(null);
  const [openDropDown, setOpenDropDown] = useState(false);
  const called = useRef(false);

  const getLocation = async () => {
    if (Location) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

      try {
        const res = await axios.get(url);
        const exactLocation = res.data.address;
        setLocation(exactLocation);
        setOpenDropDown(false);
      } catch (error) {
        console.log(error);
      }
    });
  };

  useEffect(() => {
    if (!called.current) {
      getLocation();
      called.current = true;
    }
    // Intentionally once on mount; getLocation closes over Location for early return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <NavBar
        location={Location}
        getLocation={getLocation}
        openDropDown={openDropDown}
        setOpenDropDown={setOpenDropDown}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<SinglePages />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart location={Location} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Order" element={<Order />} />
        <Route path="/OrdersForCustomr" element={<OrdersForCustomr />} />
        <Route
          path="/new-user"
          element={
            <NewUserRoute>
              <NewUser />
            </NewUserRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
