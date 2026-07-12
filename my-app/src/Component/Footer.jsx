import assets from "../assets/assets";
import { Link } from "react-router";
const Footer = () => {
  return (
    <div className="bg-slate-50 pt-10 px-4 sm:px-10 lg:px-24 xl:px-40">
      {/*Footer Top*/}
      <div className="flex justify-between lg:items-center max-lg:flex-col gap-10">
        <div className="space-y-5 text-sm text-gray-700">
          {/* <img src={assets.logo} className="w-32 sm:w-44" alt="" /> */}
          <h2 className="font-bold text-3xl">
            <span className="text-[#31859c] font-serif">V</span>ENORA
          </h2>
          <p className="max-w-md">Everything is Venora</p>
          <ul className="flex gap-8">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-primary">
                Products
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-gray-600">
          <h3 className="font-semibold">Subscribe to our newsletter</h3>
          <p className="text-sm mt-2 mb-6">
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <div className="flex gap-2 text-sm">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 text-sm outline-none rounded bg-transparent border border-gray-300"
            />
            <button className="bg-[#31859c] text-white rounded px-6">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <hr className="border-gray-300 my-6" />
      {/*Footer bottom*/}
      <div className="pb-6 text-sm text-gray-500 flex justify-center sm:justify-between gap-4 flex-wrap">
        <p>Copyright 2025 © Verona All Right Reserved.</p>
        <div className="flex items-center  justify-between gap-4">
          <img src={assets.facebook_icon} alt="" />
          <img src={assets.twitter_icon} alt="" />
          <img src={assets.instagram_icon} alt="" />
          <img src={assets.linkedin_icon} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Footer;
