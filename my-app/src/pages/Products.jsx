import { useContext, useEffect, useState } from "react";
import DataContext from "../Context/DataContext";
import FilterSection from "../Component/FilterSection";
import ProductCard from "../Component/ProductCard";
import Pagination from "../Component/Pagination";
import Lottie from "lottie-react";
import notfound from "../assets/no result found.json";
import MobileFilter from "../Component/MobileFilter";

const Products = () => {
  const { data, FetchingAllProducts } = useContext(DataContext);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [page, setPage] = useState(1);
  const [openFilter, SetOpenFilter] = useState(false);

  useEffect(() => {
    FetchingAllProducts();
    window.scrollTo(0, 0);
  }, [FetchingAllProducts]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
    SetOpenFilter(false);
  };

  const pageHandler = (selectedPage) => {
    setPage(selectedPage);
    window.scrollTo(0, 0);
  };

  const filteredData = data?.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || item.category === category) &&
      item.price >= priceRange[0] &&
      item.price <= priceRange[1],
  );

  const dynamicPage = Math.ceil(filteredData?.length / 8);

  return (
    <div id="products">
      <div className="max-w-6xl mx-auto px-10 mb-10">
        <MobileFilter
          openFilter={openFilter}
          SetOpenFilter={SetOpenFilter}
          search={search}
          SetSearch={setSearch}
          category={category}
          setCategory={setCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          handelCategoryChange={handleCategoryChange}
        />
        {data?.length > 0 ? (
          <>
            <div className="flex gap-8">
              <FilterSection
                search={search}
                SetSearch={setSearch}
                category={category}
                setCategory={setCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                handelCategoryChange={handleCategoryChange}
              />
              {filteredData?.length > 0 ? (
                <div className="flex flex-col justify-center items-center">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-7 mt-10">
                    {filteredData
                      ?.slice(page * 8 - 8, page * 8)
                      .map((product, index) => (
                        <ProductCard key={index} product={product} />
                      ))}
                  </div>
                  <Pagination
                    page={page}
                    pageHandler={pageHandler}
                    dynamicPage={dynamicPage}
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center md:h-[600px] md:w-[900px] mt-10">
                  <Lottie animationData={notfound} classID="w-[500px]" />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[400px]">
            <div className="loader"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
