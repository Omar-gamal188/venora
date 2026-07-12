const getPages = (current, total) => {
  const Pages = [];
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      Pages.push(i);
    }
  } else {
    if (current <= 3) {
      Pages.push(1, 2, 3, "...", total);
    } else if (current >= total - 2) {
      Pages.push(1, "...", total - 2, total - 1, total);
    } else {
      Pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
  }
  return Pages;
};

const Pagination = ({ page, pageHandler, dynamicPage }) => {
  return (
    <div className="mt-10 space-x-4 flex justify-center items-center">
      <button
        disabled={page === 1}
        onClick={() => page > 1 && pageHandler(page - 1)}
        className={`${
          page === 1 ? "bg-[#b7d2da]" : "bg-[#31859c]"
        } text-white px-3 py-1 rounded cursor-pointer`}
      >
        Prev
      </button>

      {getPages(page, dynamicPage)?.map((item, index) => (
        <span
          key={index}
          onClick={() => typeof item === "number" && pageHandler(item)}
          className={`cursor-pointer px-2 ${
            item === page ? "font-bold text-[#31859c]" : "text-black"
          }`}
        >
          {item}
        </span>
      ))}

      <button
        disabled={page === dynamicPage}
        onClick={() => page < dynamicPage && pageHandler(page + 1)}
        className={`${
          page === dynamicPage ? "bg-[#b7d2da]" : "bg-[#31859c]"
        } text-white px-3 py-1 rounded cursor-pointer`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
