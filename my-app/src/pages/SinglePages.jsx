import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router";
import Lottie from "lottie-react";
import notfound from "../assets/no result found.json";
import BreadCrums from "../Component/BreadCrums";
import { IoCartOutline } from "react-icons/io5";
import { useCart } from "../Context/CartContext";
import { API_BASE } from "../config/api.js";

const SinglePages = () => {
  const { addToCart } = useCart();

  const params = useParams();
  const [SingleProduct, SetSingleProduct] = useState("");
  const getSingleProduct = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products/${params.id}`);
      SetSingleProduct(res.data);
    } catch {
      try {
        const res = await axios.get(
          `https://fakestoreapi.com/products/${params.id}`,
        );
        SetSingleProduct(res.data);
        console.warn("Using FakeStore fallback for product — is the API running?", API_BASE);
      } catch (e) {
        console.error(e);
      }
    }
  }, [params.id]);
  useEffect(() => {
    getSingleProduct();
  }, [getSingleProduct]);
  const OriginalPrice = Math.round(
    SingleProduct.price + (SingleProduct.price * 4) / 100,
  );
  return (
    <>
      {SingleProduct ? (
        <div className="px-4 pb-4 md:px-0">
          <BreadCrums title={SingleProduct.title} />
          <div className="max-w-6xl mx-auto md:p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* product image/ */}
            <div className="w-full">
              <img
                src={SingleProduct.image}
                alt={SingleProduct.title}
                className="rounded-2xl w-full object-cover"
              />
            </div>
            {/* product details  */}
            <div className="flex flex-col gap-6">
              <h1 className="md:text-3xl text-xl font-bold text-gray-800">
                {SingleProduct.title}
              </h1>
              <div className="text-gray-700 ">
                {/* {SingleProduct.brand?.toUpperCase()} / */}
                {SingleProduct.category?.toUpperCase()}
                {/* {SingleProduct.model?.toUpperCase()} */}
              </div>
              <p className="text-xl text-[#62bbd4] font-bold">
                {SingleProduct.price}
                <span className="text-black">$</span>{" "}
                <span className="line-through text-gray-700">
                  {OriginalPrice}$
                </span>{" "}
                <span className="bg-[#A8E1F0] text-white rounded-full px-4 py-1">
                  4% discount
                </span>
              </p>
              <p className="text-gray-600">{SingleProduct.description}</p>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => addToCart(SingleProduct)}
                  className="px-6 flex gap-2 py-2 text-lg bg-[#62bbd4] text-white rounded-md cursor-pointer"
                >
                  <IoCartOutline className="w-6 h-6" /> Add To Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center md:h-screen md:w-screen mt-10">
          <Lottie animationData={notfound} classID="w-screen" />
        </div>
      )}
    </>
  );
};

export default SinglePages;
