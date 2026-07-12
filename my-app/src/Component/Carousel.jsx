import React, { useContext, useEffect } from "react";
import DataContext from "../Context/DataContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useNavigate } from "react-router";

const Carousel = () => {
  const navigate = useNavigate();
  const { data, FetchingAllProducts } = useContext(DataContext);
  // console.log(data);
  useEffect(() => {
    FetchingAllProducts();
  }, [FetchingAllProducts]);
  var settings = {
    dots: true,
    autoplay: true,
    autoplaySpeed: 2000,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <div>
      <Slider {...settings}>
        {data?.slice(0, 7).map((item, index) => {
          return (
            <div
              key={index}
              className="bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] -z-10"
            >
              <div className="flex flex-col md:flex-row gap-10 justify-center h-[600px] my-30 md:my-0 items-center px-4">
                <div className="md:space-y-6 space-y-3">
                  <h3 className="text-[#31859c] font-semibold font-sans text-sm">
                    With Venora Every Thing Is Done
                  </h3>
                  <h1 className="md:text-4xl text-xl font-bold uppercase line-clamp-3 md:w-[500px] text-white">
                    {item.title}
                  </h1>
                  <p className="md:w-[500px] line-clamp-3 text-gray-400 pr-7">
                    {item.description}
                  </p>
                  <button
                    onClick={() => navigate("/products")}
                    className="bg-gradient-to-r from-[#31859c] to-purple-500 text-white px-3 py-3 rounded-md cursor-pointer mt-2"
                  >
                    Shop Now
                  </button>
                </div>
                <div>
                  <img
                    src={item.image}
                    alt={item.title}
                    onClick={() => {
                      navigate(`/products/${item.id}`);
                    }}
                    className="rounded-full w-[300px] hover:scale-105 transition-all shadow-2xl shadow-[#31859c]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default Carousel;
