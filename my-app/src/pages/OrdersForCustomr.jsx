import React from "react";
import { useOrder } from "../Context/OrderContext";
import { useAuth } from "../Context/AuthContext";
import empty from "../assets/empty.json";
import Lottie from "lottie-react";

const OrdersForCustomr = () => {
  const { orders } = useOrder();
  const { user } = useAuth();
  const MyOrders = orders.filter((e) => e.email === user?.email);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {MyOrders.length > 0 ? (
        <div className="space-y-10">
          {MyOrders.map((Order, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#31859c] text-white px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">Order #{index + 1}</h2>
                  <p className="text-sm text-gray-100 mt-1">
                    Thank you for your purchase
                  </p>
                </div>

                <span
                  className={`px-5 py-2 rounded-full font-semibold ${
                    Order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : Order.status === "Preparing"
                        ? "bg-blue-100 text-blue-700"
                        : Order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : Order.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {Order.status}
                </span>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-bold text-[#31859c] mb-3">
                      Customer Details
                    </h3>

                    <div className="space-y-2 text-gray-700">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {Order.customer}
                      </p>

                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {Order.PhoneNumber}
                      </p>

                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {Order.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-300 my-8"></div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4">Item</th>
                      <th className="text-center">Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Order.items.map((item, i) => (
                      <tr key={i} className="border-b last:border-none">
                        <td className="py-5 font-medium">{item.title}</td>

                        <td className="text-center">${item.price}</td>

                        <td className="text-center">{item.quantity}</td>

                        <td className="text-right font-semibold">
                          ${item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-dashed border-gray-300 my-8"></div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">Total Items</p>

                    <h3 className="text-xl font-bold">{Order.items.length}</h3>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-500">Grand Total</p>

                    <h2 className="text-4xl font-bold text-[#31859c]">
                      ${Order.total}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-[80vh]">
          <h1 className="text-[#31859c] text-5xl font-bold mb-6">
            There Is No Orders For You...
          </h1>

          <Lottie animationData={empty} className="w-[350px] md:w-[600px]" />
        </div>
      )}
    </div>
  );
};

export default OrdersForCustomr;
