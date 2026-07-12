import React, { useState, useEffect } from "react";
import { useCart } from "../Context/CartContext";
import { FaRegTrashAlt } from "react-icons/fa";
import Lottie from "lottie-react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router";
import empty from "../assets/empty.json";
import toast from "react-hot-toast";
import Order from "./Order";
import { useOrder } from "../Context/OrderContext";
import { NavLink } from "react-router";

const Cart = ({ location }) => {
  const navigate = useNavigate();

  const { cartItem, setCartItem, updateQuantity, clearCart } = useCart();
  const { addOrder } = useOrder();
  const { user } = useAuth();
  const totalPrice = cartItem.reduce((total, item) => total + item.price, 0);
  const shipping = 5;
  const grandTotal = totalPrice + shipping;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (user?.fullName) setName(user.fullName);
    if (user?.email) setEmail(user.email);
  }, [user]);
  const [Address, setAddress] = useState(""); //`${location.village},${location.state},${location.country}` ||
  const [state, setState] = useState(""); //location.state ||
  const [countryCode, setCountryCode] = useState(""); //location.country_code ||
  const [country, setCountry] = useState(""); //location.country ||
  const [PhoneNumber, SetPhoneNumber] = useState("");

  const order = {
    id: Date.now(),
    customer: name,
    items: cartItem,
    total: totalPrice,
    status: "Pending",
    paymentMethod: "Cash",
    address: Address,
    createdAt: new Date().toISOString(),
    PhoneNumber: PhoneNumber,
    email: email,
  };

  return (
    <div
      className="mt-10 max-w-6xl mx-auto mb-10 overflow-hidden px-4 md:px-0"
      id="cart"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mt-14 mb-10">
        <div>
          <h1 className="text-2xl font-bold mb-5">{cartItem.length} Items</h1>
        </div>

        <NavLink
          to={"/OrdersForCustomr"}
          className="mt-5 md:mt-0 px-6 py-3 rounded-xl bg-[#31859c] text-white font-semibold hover:bg-[#286f82] transition shadow-lg shadow-[#31859c]/30"
        >
          My Orders
        </NavLink>
      </div>
      {cartItem.length > 0 ? (
        <div>
          {/* Cart Items */}

          <div className="mt-10">
            {cartItem.map((item, index) => {
              return (
                <div
                  key={index}
                  className="bg-gray-100 p-5 rounded-md flex items-center justify-between mt-3 w-full"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      onClick={() => {
                        navigate(`/products/${item.id}`);
                      }}
                      className="w-20 h-20 rounded-md cursor-pointer"
                    />

                    <div>
                      <h1 className="md:w-[300px] line-clamp-2">
                        {item.title}
                      </h1>

                      <p className="text-[#31859c] font-semibold text-lg">
                        {item.price} $
                      </p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="bg-[#31859c] text-white flex gap-4 p-2 rounded-md font-bold text-xl">
                    <button
                      onClick={() => {
                        updateQuantity(item.id, "increase");
                        toast.success("quantity is increase");
                      }}
                      className="cursor-pointer"
                    >
                      +
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => {
                        updateQuantity(item.id, "decrease");
                        toast.success("quantity is decrease");
                      }}
                      className="cursor-pointer"
                    >
                      -
                    </button>
                  </div>

                  {/* Delete */}
                  <span
                    className="hover:bg-white/60 transition-all rounded-full p-3 hover:shadow-xl"
                    onClick={() => {
                      const newCart = cartItem.filter((e) => e.id !== item.id);
                      setCartItem(newCart);
                      toast.success("Product is deleted");
                    }}
                  >
                    <FaRegTrashAlt className="text-[#31859c] text-2xl cursor-pointer" />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Delivery + Order Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20 mt-10">
            {/* Delivery Info */}
            <div className="bg-gray-100 rounded-md p-7 space-y-4">
              <h1 className="text-gray-800 font-bold text-xl">Delivery Info</h1>

              <div className="flex flex-col">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter Your Name"
                  className="p-2 rounded-md border"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Enter Your Address"
                  value={Address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="p-2 rounded-md border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label>State</label>
                  <input
                    type="text"
                    placeholder="Enter Your State"
                    className="p-2 rounded-md border"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                {/* <div className="flex flex-col">
                  <label>postcode</label>
                  <input
                    type="text"
                    placeholder="Enter Your country code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="p-2 rounded-md border"
                  />
                </div> */}

                {/* <div className="flex flex-col">
                  <label>Country</label>
                  <input
                    type="text"
                    placeholder="Enter Your Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="p-2 rounded-md border"
                  />
                </div> */}

                <div className="flex flex-col">
                  <label>Phone no</label>
                  <input
                    value={PhoneNumber}
                    onChange={(e) => {
                      SetPhoneNumber(e.target.value);
                    }}
                    type="text"
                    placeholder="Enter Your Number"
                    className="p-2 rounded-md border"
                  />
                </div>
              </div>

              <div className="text-center text-gray-500 mt-4">
                -------- OR --------
              </div>

              <button
                className="bg-[#31859c] text-white w-full py-2 rounded-md hover:bg-[#1b6478] transition"
                onClick={() => {
                  setState(location.state);
                  setAddress(
                    `${location.city},${location.state},${location.country}`,
                  );
                  setCountry(location.country);
                  setCountryCode(location.postcode);
                }}
              >
                Detect Location
              </button>
            </div>

            {/* Bill Details */}

            <div className="bg-gray-100 rounded-md p-7 h-fit">
              <h1 className="text-xl font-bold mb-4">Bill details</h1>

              <div className="flex justify-between mb-2">
                <span>Items total</span>
                <span>${totalPrice}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>${shipping}</span>
              </div>

              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Grand total</span>
                <span>${grandTotal}</span>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <p className="mb-2">Apply Promo Code</p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 p-2 border rounded-md"
                  />

                  <button className="px-4 bg-[#31859c] text-white rounded-md hover:bg-[#1b6478] transition">
                    Apply
                  </button>
                </div>
              </div>

              <button
                className="bg-[#31859c] text-white w-full py-3 rounded-md mt-6 hover:bg-[#1b6478] transition"
                onClick={() => {
                  if (!user) {
                    toast.error("Please sign in to place an order");
                    navigate("/login");
                    return;
                  }
                  if (Address === "" || name === "" || PhoneNumber === "") {
                    toast.error("Please fill Delivery Info!");
                    return;
                  }

                  addOrder(order);
                  clearCart();
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center md:h-[1000px] md:w-[1100px] mt-10">
          <h1 className="text-[#31859c] text-6xl font-semibold ">
            Cart Is Empty...
          </h1>
          <Lottie animationData={empty} className="md:w-[700px] w-[500px] " />
          <button
            className="mb-2 text-white cursor-pointer bg-[#31859c] rounded-md font-semibold p-2"
            onClick={() => navigate("/products")}
          >
            Contain Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
