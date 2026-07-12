import React from "react";
import { useNavigate } from "react-router";

const BreadCrums = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl mx-auto my-10">
      <h className="text-xl text-gray-700 font-semibold">
        <span className=" cursor-pointer" onClick={() => navigate("/")}>
          Home
        </span>{" "}
        /{" "}
        <span className=" cursor-pointer" onClick={() => navigate("/products")}>
          products
        </span>{" "}
        / <span>{title}</span>
      </h>
    </div>
  );
};

export default BreadCrums;
