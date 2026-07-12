import bg from "../assets/venora.jpg";
import { useNavigate } from "react-router-dom";

const MidBanner = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-100 md:py-24 my-10">
      <div
        className="relative max-w-7xl mx-auto md:rounded-2xl pt-28 bg-cover bg-center h-[550px] md:h-[600px]"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/60 md:rounded-2xl bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              Everything you need… in one place
            </h1>
            <p className="text-lg md:text-xl mb-6">
              Shop with ease, guaranteed quality, and prices that suit you.
            </p>
            <button
              className="bg-[#31859c] hover:bg-[#2db2e6] text-white font-semibold py-2 px-4 md:py-3 md:px-6 rounded-lg transition duration-300"
              onClick={() => navigate("/products")}
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidBanner;
