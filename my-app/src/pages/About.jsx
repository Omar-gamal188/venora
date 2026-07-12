// import React from "react";

// const About = () => {
//   return (
//     <div id="about">
//       <div className="px-4 py-10 md:px-10 lg:px-20">
//         <div className="max-w-5xl mx-auto text-center">
//           <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#31859c]">
//             About Venora
//           </h1>

//           <p className="text-gray-600 mb-4 text-sm md:text-base">
//             Welcome to{" "}
//             <span className="font-semibold text-[#31859c]">Venora</span> — your
//             all-in-one online store for everything you need in your daily life.
//           </p>

//           <p className="text-gray-600 mb-4 text-sm md:text-base">
//             Founded in 2023, Venora was built to offer a wide range of products
//             — from fashion and electronics to home essentials and more — all in
//             one place.
//           </p>

//           <p className="text-gray-600 mb-8 text-sm md:text-base">
//             We focus on quality, affordability, and convenience to make your
//             shopping experience simple and enjoyable.
//           </p>
//         </div>

//         {/* Features */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
//           {[
//             "Wide variety of products",
//             "Affordable prices",
//             "Fast delivery",
//             "Trusted quality",
//           ].map((item, index) => (
//             <div
//               key={index}
//               className="bg-[#31859c]/10 p-6 rounded-2xl shadow-sm text-center hover:shadow-md hover:bg-[#31859c]/20 transition"
//             >
//               <p className="font-medium text-[#31859c]">{item}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default About;
import React from "react";
import { ShieldCheck, Truck, Tags, ShoppingBag } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 px-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800">
            About <span className="text-[#31859c]">Venora</span>
          </h1>

          <div className="w-24 h-1 bg-[#31859c] rounded-full mx-auto mt-5"></div>

          <p className="text-gray-600 mt-8 leading-8">
            Welcome to{" "}
            <span className="font-semibold text-[#31859c]">Venora</span>, your
            all-in-one online shopping destination. We bring together quality
            products, affordable prices, and a smooth shopping experience—all in
            one place.
          </p>

          <p className="text-gray-600 mt-5 leading-8">
            Founded in 2023, Venora was created to make online shopping easier
            by offering everything from fashion and electronics to home
            essentials with fast delivery and trusted quality.
          </p>
        </div>

        {/* Features */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#31859c]/10 flex items-center justify-center group-hover:bg-[#31859c] transition">
              <ShoppingBag
                size={30}
                className="text-[#31859c] group-hover:text-white transition"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-6">
              Wide Variety
            </h3>

            <p className="text-gray-500 mt-3">
              Discover products from multiple categories in one place.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#31859c]/10 flex items-center justify-center group-hover:bg-[#31859c] transition">
              <Tags
                size={30}
                className="text-[#31859c] group-hover:text-white transition"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-6">
              Best Prices
            </h3>

            <p className="text-gray-500 mt-3">
              Competitive prices with amazing offers every day.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#31859c]/10 flex items-center justify-center group-hover:bg-[#31859c] transition">
              <Truck
                size={30}
                className="text-[#31859c] group-hover:text-white transition"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-6">
              Fast Delivery
            </h3>

            <p className="text-gray-500 mt-3">
              Quick and reliable shipping to your doorstep.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#31859c]/10 flex items-center justify-center group-hover:bg-[#31859c] transition">
              <ShieldCheck
                size={30}
                className="text-[#31859c] group-hover:text-white transition"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-6">
              Trusted Quality
            </h3>

            <p className="text-gray-500 mt-3">
              Every product is carefully selected to ensure top quality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
