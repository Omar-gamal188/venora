import { useContext } from "react";
import DataContext from "../Context/DataContext";

const FilterSection = ({
  search,
  SetSearch,
  category,
  priceRange,
  setPriceRange,
  handelCategoryChange,
  setCategory,
}) => {
  const { categoryOnlyData } = useContext(DataContext);
  return (
    <div className="bg-gray-100 mt-10 p-4 rounded-md h-max hidden md:block">
      <input
        type="text"
        value={search}
        placeholder="Search..."
        className="bg-white p-2 rounded-md  border-gray-400 border-2"
        onChange={(e) => {
          SetSearch(e.target.value);
        }}
      />

      {/* category only data */}
      <h1 className="mt-5 font-semibold text-xl">category</h1>
      <div className="flex flex-col gap-2 mt-3">
        {categoryOnlyData?.map((item, index) => {
          return (
            <div key={index} className="flex gap-2">
              <input
                type="checkbox"
                name={item}
                checked={category === item}
                value={item}
                onChange={handelCategoryChange}
              />
              <button className="cursor-pointer uppercase">{item}</button>
            </div>
          );
        })}
      </div>
      {/* brand only data */}
      {/* <h1 className="mt-5 font-semibold text-xl">Brand</h1> */}
      {/* <div className="flex flex-col gap-2 mt-3">
        {brandOnlyData?.map((item, index) => {
          return (
            <div key={index} className="flex gap-2">
              <input type="checkbox" />
              <button className="cursor-pointer uppercase">{item}</button>
            </div>
          );
        })}
      </div> */}
      {/* price range */}
      <h1 className="mt-5 font-semibold text-xl">Price Range</h1>
      <div className="flex flex-col gap-2">
        <label htmlFor="">
          Price Range : {priceRange[0]} - {priceRange[1]} L.E{" "}
        </label>
        <input
          type="range"
          name=""
          id=""
          min={0}
          max={10000}
          value={priceRange[1]}
          onChange={(e) => {
            setPriceRange([priceRange[0], Number(e.target.value)]);
          }}
        />
      </div>
      <button
        className="bg-[#31859c] text-white rounded-md px-3 py-1 mt-5 cursor-pointer"
        onClick={() => {
          SetSearch("");
          setCategory("All");
          setPriceRange([0, 1000]);
        }}
      >
        Reset Filter
      </button>
    </div>
  );
};

export default FilterSection;
