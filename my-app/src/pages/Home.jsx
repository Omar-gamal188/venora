import React from "react";
import Carousel from "../Component/Carousel";
import Features from "../Component/Features";
import MidBanner from "../Component/MidBanner";

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <Carousel />
      <MidBanner />
      <Features />
    </div>
  );
};

export default Home;
