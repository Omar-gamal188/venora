import { useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import DataContext from "../Context/DataContext";
import { API_BASE } from "../config/api.js";
import { NavLink } from "react-router";
import FilterSection from "../Component/FilterSection.jsx";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Resize and JPEG-encode uploads so JSON payloads stay small (avoids 413 / MongoDB 16MB cap). */
async function compressImageFile(file, maxEdge = 1600, quality = 0.82) {
  if (!file?.type?.startsWith("image/")) {
    return readFileAsDataUrl(file);
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = objectUrl;
    });
    let { width, height } = img;
    const maxDim = Math.max(width, height);
    const scale = maxDim > maxEdge ? maxEdge / maxDim : 1;
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return readFileAsDataUrl(file);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return readFileAsDataUrl(file);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const Dashboard = () => {
  const { data, FetchingAllProducts } = useContext(DataContext);
  useEffect(() => {
    FetchingAllProducts();
  }, [FetchingAllProducts]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState(true);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [Description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const addProduct = async () => {
    if (!name?.trim() || !price || !category?.trim()) {
      toast.error("Name, category, and price are required");
      return;
    }
    let finalImage = imageUrl.trim();
    if (image) {
      try {
        finalImage = await compressImageFile(image);
      } catch {
        toast.error("Could not read image file");
        return;
      }
    }
    if (!finalImage) {
      toast.error("Add an image file or paste an image URL");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API_BASE}/api/products`, {
        title: name.trim(),
        price: Number(price),
        category: category.trim(),
        description: Description?.trim() || "",
        image: finalImage,
        inStock,
      });
      toast.success("Product saved to database");
      setName("");
      setCategory("");
      setPrice("");
      setInStock(true);
      setImage(null);
      setImageUrl("");
      setDescription("");
      await FetchingAllProducts();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Could not save product";
      toast.error(msg);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/products/${id}`);
      toast.success("Product removed");
      await FetchingAllProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete");
      console.error(err);
    }
  };

  const toggleStock = async (product) => {
    try {
      await axios.patch(`${API_BASE}/api/products/${product.id}`, {
        inStock: !product.inStock,
      });
      await FetchingAllProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update");
      console.error(err);
    }
  };

  return (
    <div id="dashboard" className="min-h-screen">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-14 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Admin Dashboard
            </h1>

            <p className="text-gray-500 mt-2">Manage your products with ease</p>
          </div>

          <NavLink
            to={"/Order"}
            className="mt-5 md:mt-0 px-6 py-3 rounded-xl bg-[#31859c] text-white font-semibold hover:bg-[#286f82] transition shadow-lg shadow-[#31859c]/30"
          >
            Orders
          </NavLink>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Product */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-[#31859c] p-5">
                <h2 className="text-2xl text-white font-bold">Add Product</h2>
              </div>

              <div className="p-6 space-y-5">
                <input
                  placeholder="Product title"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#31859c]"
                />

                <input
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#31859c]"
                />

                <textarea
                  rows="4"
                  placeholder="Description"
                  value={Description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 resize-none outline-none focus:border-[#31859c]"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#31859c]"
                />

                <input
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#31859c]"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-dashed border-gray-300 p-3"
                />

                <p className="text-sm text-gray-500">
                  Use an image URL or upload a file.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={() => setInStock(!inStock)}
                    className="w-5 h-5 accent-[#31859c]"
                  />

                  <span className="font-medium text-gray-700">In Stock</span>
                </div>

                <button
                  type="button"
                  onClick={addProduct}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-[#31859c] hover:bg-[#286f82] text-white font-semibold transition shadow-lg shadow-[#31859c]/30 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Product"}
                </button>
              </div>
            </div>
          </div>
          {/*Filter Section*/}
          {/* <FilterSection /> */}
          {/* Products */}
          <div className="lg:col-span-2 space-y-6 m-8">
            {(Array.isArray(data) ? data : []).map((product) => {
              const title = product.title ?? product.name;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="h-2 bg-[#31859c]" />

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex gap-5">
                        <img
                          src={product.image}
                          alt={title}
                          className="w-32 h-32 rounded-2xl object-cover border"
                        />

                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {title}
                          </h2>

                          <p className="mt-2 text-gray-500">
                            {product.category}
                          </p>

                          <p className="mt-3 text-3xl font-bold text-[#31859c]">
                            ${product.price}
                          </p>

                          <span
                            className={`inline-flex mt-4 px-4 py-2 rounded-full text-sm font-semibold ${
                              product.inStock !== false
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.inStock !== false
                              ? "In Stock"
                              : "Out of Stock"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between">
                        <div className="bg-gray-50 rounded-2xl p-5 border">
                          <p className="text-sm text-gray-500">Product ID</p>

                          <p className="font-semibold text-gray-700 break-all">
                            {product.id}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-5">
                          <button
                            type="button"
                            onClick={() => toggleStock(product)}
                            className="px-6 py-3 rounded-xl bg-[#31859c] hover:bg-[#286f82] text-white font-semibold transition shadow-lg shadow-[#31859c]/30"
                          >
                            Toggle Stock
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteProduct(product.id)}
                            className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
