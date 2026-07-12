import { MapPin } from "lucide-react";
import { FaCaretDown } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { NavLink } from "react-router";
import { Link } from "react-router";
import { CgClose } from "react-icons/cg";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { useState } from "react";
import { HiMenuAlt1, HiMenuAlt3 } from "react-icons/hi";
import ResponsiveMenu from "./ResponsiveMenu";

const NavBar = ({ location, getLocation, openDropDown, setOpenDropDown }) => {
  const [openNav, setOpenNave] = useState(false);
  const toggleDropDown = () => {
    setOpenDropDown(!openDropDown);
  };
  const { cartItem } = useCart();
  const { user, logout } = useAuth();

  return (
    <div className="bg-white py-3 shadow-2xl px-4 md:px-0">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* logo */}
        <div className="flex gap-7 items-center">
          <Link to={"/"}>
            <h2 className="font-bold text-3xl">
              <span className="text-[#31859c] font-serif">V</span>ENORA
            </h2>
          </Link>
          <div className="md:flex gap-1 cursor-pointer text-gray-700 items-center hidden">
            <MapPin className="text-[#31859c]" />
            <span className="font-semibold">
              {location ? (
                <div className="-space-y-1">
                  <p>{location.country}</p>
                  <p>{location.state}</p>
                </div>
              ) : (
                "Add Address"
              )}
            </span>
            <FaCaretDown onClick={toggleDropDown} />
          </div>
          {openDropDown ? (
            <div
              className="w-[250px] h-max shadow-2xl z-50 bg-white fixed top-16 left-60 
            border-2 p-5 border-gray-100 rounded-md"
            >
              <h1 className="font-semibold mb-4 text-xl flex justify-between">
                Change Location
                <span>
                  <CgClose cursor={"pointer"} onClick={toggleDropDown} />
                </span>
              </h1>
              <button
                onClick={getLocation}
                className="bg-[#31859c] text-white px-3 py-1 rounded-md cursor-pointer hover:bg-red-400"
              >
                Detect My Location
              </button>
            </div>
          ) : null}
        </div>
        {/* ==logo== */}
        {/* menu */}
        <nav className="flex gap-7 items-center">
          <ul className="md:flex gap-7 items-center text-xl font-semibold hidden">
            <NavLink
              to={"/"}
              className={({ isActive }) =>
                `${
                  isActive
                    ? "border-b-3 transition-all border-[#31859c]"
                    : "text-black"
                } cursor-pointer`
              }
            >
              <li>Home</li>
            </NavLink>
            <NavLink
              to={"/products"}
              className={({ isActive }) =>
                `${
                  isActive
                    ? "border-b-3 transition-all border-[#31859c]"
                    : "text-black"
                } cursor-pointer`
              }
            >
              <li>Products</li>
            </NavLink>
            <NavLink
              to={"/about"}
              className={({ isActive }) =>
                `${
                  isActive
                    ? "border-b-3 transition-all border-[#31859c]"
                    : "text-black"
                } cursor-pointer`
              }
            >
              <li>About</li>
            </NavLink>
            <NavLink
              to={"/contact"}
              className={({ isActive }) =>
                `${
                  isActive
                    ? "border-b-3 transition-all border-[#31859c]"
                    : "text-black"
                } cursor-pointer`
              }
            >
              <li>Contact</li>
            </NavLink>
            {user?.role === "admin" ? (
              <NavLink
                to={"/dashboard"}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "border-b-3 transition-all border-[#31859c]"
                      : "text-black"
                  } cursor-pointer `
                }
              >
                <li>Dashboard</li>
              </NavLink>
            ) : null}
          </ul>
          <Link to={"/cart"} className="relative">
            <IoCartOutline className="w-7 h-7" />
            <span className="bg-[#31859c] px-2 rounded-full absolute -top-3 -right-3 text-white">
              {cartItem.length}
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-l font-semibold black max-w-[120px] truncate">
                  {user.fullName || user.username}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md cursor-pointer text-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to={"/login"}
                className="bg-[#31859c] text-white px-3 py-1 rounded-md cursor-pointer text-sm"
              >
                Sign in
              </Link>
            )}
          </div>
          {openNav ? (
            <HiMenuAlt3
              className="h-7 w-7 md:hidden"
              onClick={() => setOpenNave(false)}
            />
          ) : (
            <HiMenuAlt1
              className="h-7 w-7 md:hidden"
              onClick={() => setOpenNave(true)}
            />
          )}
        </nav>
        {/* ==menu== */}
      </div>
      <ResponsiveMenu openNav={openNav} setOpenNave={setOpenNave} />
    </div>
  );
};

export default NavBar;
