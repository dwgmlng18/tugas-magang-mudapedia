"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category_id: { _id: string; name: string };
}

export default function MenuPage() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("semua");
  const [loading, setLoading]           = useState(true);

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

  const filtered =
    activeCategory === "semua"
      ? products
      : products.filter((p) => p.category_id._id === activeCategory);

  const formatRupiah = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-[9px] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[15px] font-extrabold">C</span>
            </div>
            <div>
              <p className="text-[16px] font-extrabold text-gray-900 leading-none">Caelas</p>
              <p className="text-[11px] text-gray-400 leading-none mt-0.5">Menu & Katalog</p>
            </div>
          </div>
          <Link
            href="/login"
            className="bg-green-600 hover:bg-green-700 text-white text-[13px] font-bold px-5 py-2 rounded-lg transition"
          >
            Masuk
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-6">

        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveCategory("semua")}
            className={`px-5 py-2 rounded-lg text-[13px] font-semibold border-[1.5px] transition-all ${
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
              className={`px-5 py-2 rounded-lg text-[13px] font-semibold border-[1.5px] transition-all ${
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
            <p className="text-gray-400 text-sm font-medium">Belum ada produk tersedia.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border-[1.5px] border-gray-200 overflow-hidden"
              >
                {/* Gambar */}
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
                      <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[11px] font-bold text-green-600 uppercase tracking-wide mb-1">
                    {product.category_id.name}
                  </p>
                  <h3 className="text-[14px] font-bold text-gray-900 leading-snug mb-1">
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

      <p className="text-center text-gray-300 text-xs py-8">© 2026 Caelas. All rights reserved.</p>
    </div>
  );
}