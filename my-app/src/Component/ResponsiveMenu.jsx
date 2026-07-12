import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router";
import { useAuth } from "../Context/AuthContext";

const ResponsiveMenu = ({ openNav, setOpenNave }) => {
  const { user, logout } = useAuth();
  return (
    <div
      className={`${openNav ? "left-0" : "left-[100%]"} fixed bottom-0 top-0 z-20 flex h-screen w-[75%] flex-col justify-between bg-white px-8 pb-6 pt-16 text-black md:hidden rounded-r-xl shadow-md transition-all`}
    >
      <div>
        <div className="flex items-center justify-start gap-3">
          <FaUserCircle size={50} className="text-gray-400" />
          <div>
            <h1>Hello, {user?.fullName || user?.username || "guest"}</h1>
            <h1 className="text-sm text-slate-500">
              {user?.email || "Sign in for your account"}
            </h1>
          </div>
        </div>
        {user ? (
          <button
            type="button"
            onClick={() => {
              logout();
              setOpenNave(false);
            }}
            className="mt-4 w-full rounded-lg bg-gray-200 py-2 text-sm font-semibold text-gray-800"
          >
            Log out
          </button>
        ) : (
          <Link
            to="/login"
            className="mt-4 block w-full rounded-lg bg-[#31859c] py-2 text-center text-sm font-semibold text-white"
            onClick={() => setOpenNave(false)}
          >
            Sign in
          </Link>
        )}
        <nav className="mt-12">
          <ul className="flex flex-col gap-7 text-2xl font-semibold">
            <Link
              to={"/"}
              className="cursor-pointer"
              onClick={() => setOpenNave(false)}
            >
              <li>Home</li>
            </Link>
            <Link
              to={"/products"}
              className="cursor-pointer"
              onClick={() => setOpenNave(false)}
            >
              <li>Products</li>
            </Link>
            <Link
              to={"/about"}
              className="cursor-pointer"
              onClick={() => setOpenNave(false)}
            >
              <li>About</li>
            </Link>
            <Link
              to={"/contact"}
              className="cursor-pointer"
              onClick={() => setOpenNave(false)}
            >
              <li>Contact</li>
            </Link>
            {user?.role === "admin" ? (
              <Link
                to={"/dashboard"}
                className="cursor-pointer"
                onClick={() => setOpenNave(false)}
              >
                <li>Dashboard</li>
              </Link>
            ) : null}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ResponsiveMenu;
