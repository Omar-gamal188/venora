import React, { use } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { useOrder } from "../Context/OrderContext";
import empty from "../assets/empty.json";
import Lottie from "lottie-react";
import Swal from "sweetalert2";

const Order = ({}) => {
  const { orders, addOrder, delOrder, UpdateOrderStatus } = useOrder();

  // Update Status Dialog
  const showUpdateStatusDialog = async (id) => {
    const { value: status } = await Swal.fire({
      title: "Update Order Status",
      input: "select",
      inputOptions: {
        Pending: "Pending",
        Preparing: "Preparing",
        Delivered: "Delivered",
        Cancelled: "Cancelled",
      },
      inputPlaceholder: "Select Status",
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#31859c",
    });

    if (!status) return;

    UpdateOrderStatus(id, status);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 py-10" id="order">
      {orders.length > 0 ? (
        <div className="space-y-8">
          {orders?.map((Order, index) => {
            return (
              <div
                key={index}
                className="group bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="h-2 bg-[#31859c]" />

                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b border-gray-200 pb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">
                        Order #{index + 1}
                      </h2>

                      <p className="text-gray-500 mt-1">
                        Customer Order Information
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

                  <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5 mt-8">
                    <div className="bg-gray-50 rounded-2xl p-5 border">
                      <p className="text-gray-500 text-sm">Customer Name</p>

                      <h3 className="text-xl font-semibold text-gray-800 mt-2">
                        {Order.customer}
                      </h3>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 border">
                      <p className="text-gray-500 text-sm">Phone Number</p>

                      <h3 className="text-xl font-semibold text-gray-800 mt-2">
                        {Order.PhoneNumber}
                      </h3>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 border">
                      <p className="text-gray-500 text-sm">Total Price</p>

                      <h3 className="text-xl font-bold text-[#31859c] mt-2">
                        ${Order.total}
                      </h3>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 border lg:col-span-1 md:col-span-2">
                      <p className="text-gray-500 text-sm">Shipping Address</p>

                      <h3 className="text-lg font-medium text-gray-800 mt-2">
                        {Order.address}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-800">
                        Ordered Items
                      </h3>

                      <span className="text-[#31859c] font-semibold">
                        {Order.items?.length} Items
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-200">
                      <table className="w-full">
                        <thead className="bg-[#31859c] text-white">
                          <tr>
                            <th className="text-left px-6 py-4">Product</th>
                            <th className="text-center px-6 py-4">Price</th>
                            <th className="text-center px-6 py-4">Quantity</th>
                          </tr>
                        </thead>

                        <tbody>
                          {Order.items?.map((item, index) => (
                            <tr
                              key={index}
                              className="border-t hover:bg-gray-50 transition"
                            >
                              <td className="px-6 py-4 font-medium text-gray-800">
                                {item.title}
                              </td>

                              <td className="text-center text-gray-600">
                                ${item.price}
                              </td>

                              <td className="text-center text-gray-600">
                                {item.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                    <button
                      className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-medium"
                      onClick={() => {
                        delOrder(Order.id);
                      }}
                    >
                      Delete Order
                    </button>

                    <button
                      className="px-6 py-3 rounded-xl bg-[#31859c] hover:bg-[#286f82] text-white font-medium shadow-lg shadow-[#31859c]/30 transition-all duration-300"
                      onClick={() => {
                        showUpdateStatusDialog(Order.id);
                      }}
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-[80vh]">
          <h1 className="text-[#31859c] text-5xl md:text-6xl font-bold mb-6">
            There Is No Orders...
          </h1>

          <Lottie animationData={empty} className="w-[350px] md:w-[600px]" />
        </div>
      )}
    </div>
  );
};

export default Order;
