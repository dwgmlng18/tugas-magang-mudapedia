"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconPhoto, IconSearch, IconX } from "@tabler/icons-react";

interface Category {
  _id:  string;
  name: string;
}

interface Product {
  _id:          string;
  name:         string;
  description?: string;
  price:        number;
  image?:       string;
  category_id:  { _id: string; name: string } | null;
}

const formatRupiah = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(price);

export default function KasirProdukPage() {
  const [products,       setProducts]       = useState<Product[]>([]);
  const [categories,     setCategories]     = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("semua");
  const [search,         setSearch]         = useState("");
  const [loading,        setLoading]        = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products);
      setCategories(data.categories);
    } catch (err) {
      console.error("Gagal fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  /* Filter kategori dulu, lalu filter nama */
  const filtered = products
    .filter((p) => activeCategory === "semua" || p.category_id?._id === activeCategory)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[18px] font-bold text-gray-900 leading-none">Katalog Produk</h1>
        <p className="text-[12px] text-gray-400 mt-1">
          {loading ? "Memuat..." : `${filtered.length} produk tersedia`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <IconSearch
          size={15}
          stroke={2}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama produk..."
          className="w-full border-[1.5px] border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[13px]
                     text-gray-800 placeholder-gray-300 outline-none focus:border-green-400 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <IconX size={14} stroke={2} />
          </button>
        )}
      </div>

      {/* Filter Kategori */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setActiveCategory("semua")}
          className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold border-[1.5px] transition-all ${
            activeCategory === "semua"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold border-[1.5px] transition-all ${
              activeCategory === cat._id
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-24">
          <div className="w-9 h-9 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Kosong */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-24">
          <p className="text-gray-400 text-sm font-medium">
            {search ? `Tidak ada produk dengan nama "${search}".` : "Belum ada produk tersedia."}
          </p>
        </div>
      )}

      {/* Grid Produk */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl border-[1.5px] border-gray-200 overflow-hidden"
            >
              <div className="relative w-full aspect-square bg-[#f0fdf4]">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconPhoto size={40} stroke={1} className="text-green-200" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-[11px] font-bold text-green-600 uppercase tracking-wide mb-1">
                  {product.category_id?.name ?? "Tanpa Kategori"}
                </p>
                <h3 className="text-[14px] font-bold text-gray-900 leading-snug mb-1 truncate">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-[12px] text-gray-400 leading-relaxed mb-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <p className="text-[15px] font-extrabold text-green-600">
                  {formatRupiah(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}