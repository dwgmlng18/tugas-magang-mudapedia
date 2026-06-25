"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  IconSearch, IconX, IconShoppingCart, IconPhoto,
  IconPlus, IconMinus, IconTrash, IconArrowLeft, IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface Category { _id: string; name: string; }
interface Product {
  _id: string; name: string; price: number;
  image?: string; category_id: { _id: string; name: string } | null;
}
interface CartItem {
  product_id:   string | null;
  product_name: string;   // snapshot nama produk
  name:         string;   // display name (sama dengan product_name)
  price:        number;
  image?:       string;
  quantity:     number;
  subtotal:     number;
  deleted?:     boolean;  // produk sudah dihapus dari katalog
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function EditTransaksiPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params.id as string;

  const [products,       setProducts]       = useState<Product[]>([]);
  const [categories,     setCategories]     = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("semua");
  const [search,         setSearch]         = useState("");
  const [loading,        setLoading]        = useState(true);
  const [cart,           setCart]           = useState<CartItem[]>([]);
  const [saving,         setSaving]         = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch(`/api/kasir/transactions/${id}`).then((r) => r.json()),
    ]).then(([productData, trxData]) => {
      setProducts(productData.products ?? []);
      setCategories(productData.categories ?? []);

      if (trxData.transaction?.items) {
        setCart(
          trxData.transaction.items
            .filter((item: {
              product_id: string | null;
              isPermanent?: boolean;
            }) => !item.isPermanent && item.product_id !== null)
            .map((item: {
              product_id: string | null;
              name: string;
              price: number;
              image?: string;
              quantity: number;
              subtotal: number;
              deleted?: boolean;
            }) => ({
              product_id:   item.product_id,
              product_name: item.name,
              name:         item.name,
              price:        item.price,
              image:        item.image,
              quantity:     item.quantity,
              subtotal:     item.subtotal,
              deleted:      item.deleted ?? false,
            }))
        );
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = products
    .filter((p) => activeCategory === "semua" || p.category_id?._id === activeCategory)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((c) => c.product_id === product._id);
      if (exist) {
        return prev.map((c) =>
          c.product_id === product._id
            ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.price }
            : c
        );
      }
      return [...prev, {
        product_id:   product._id,
        product_name: product.name,
        name:         product.name,
        price:        product.price,
        image:        product.image,
        quantity:     1,
        subtotal:     product.price,
        deleted:      false,
      }];
    });
  };

  const changeQty = (product_id: string | null, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => c.product_id === product_id
          ? { ...c, quantity: c.quantity + delta, subtotal: (c.quantity + delta) * c.price }
          : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (product_id: string | null) => {
    setCart((prev) => prev.filter((c) => c.product_id !== product_id));
  };

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.subtotal, 0);

  const handleSave = async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/kasir/transactions/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          items: cart.map((c) => ({
            product_id:   c.product_id,
            product_name: c.product_name,
            quantity:     c.quantity,
            price:        c.price,
            subtotal:     c.subtotal,
          })),
        }),
      });
      if (!res.ok) { console.error("Gagal update"); return; }
      router.push("/dashboard/kasir/transaksi");
    } catch { console.error("Error update transaksi"); }
    finally { setSaving(false); }
  };

  const cartQty = (product_id: string) =>
    cart.find((c) => c.product_id === product_id)?.quantity ?? 0;

  const hasDeletedInCart = cart.some((c) => c.deleted);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-9 h-9 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                     hover:bg-gray-50 transition-colors text-gray-400">
          <IconArrowLeft size={15} stroke={2} />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-gray-900 leading-none">Edit Transaksi</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Ubah produk atau jumlah — tanggal akan diperbarui otomatis
          </p>
        </div>
      </div>

      {/* Layout 2 kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 flex-1 min-h-0">

        {/* Panel kiri — katalog */}
        <div className="flex flex-col min-h-0">
          <div className="relative mb-3">
            <IconSearch size={14} stroke={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk..."
              className="w-full border-[1.5px] border-gray-200 rounded-lg pl-9 pr-9 py-2 text-[13px]
                         text-gray-800 placeholder-gray-300 outline-none focus:border-green-400 transition-colors" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <IconX size={13} stroke={2} />
              </button>
            )}
          </div>

          {/* Filter kategori */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button onClick={() => setActiveCategory("semua")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border-[1.5px] whitespace-nowrap transition-all ${
                activeCategory === "semua"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"
              }`}>
              Semua
            </button>
            {categories.map((cat) => (
              <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border-[1.5px] whitespace-nowrap transition-all ${
                  activeCategory === cat._id
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"
                }`}>
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pb-2">
            {filtered.map((product, index) => {
              const qty = cartQty(product._id);
              return (
                <div key={product._id}
                  className={`bg-white rounded-xl border-[1.5px] overflow-hidden transition-all ${
                    qty > 0 ? "border-green-400 shadow-sm shadow-green-100" : "border-gray-200"
                  }`}>
                  <div className="relative w-full aspect-square bg-[#f0fdf4]">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw" priority={index < 3} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconPhoto size={32} stroke={1} className="text-green-200" />
                      </div>
                    )}
                    {qty > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-green-600 text-white
                                       text-[10px] font-bold rounded-full flex items-center justify-center">
                        {qty}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-bold text-green-600 uppercase tracking-wide mb-0.5">
                      {product.category_id?.name ?? "–"}
                    </p>
                    <p className="text-[13px] font-bold text-gray-900 truncate mb-1">{product.name}</p>
                    <p className="text-[13px] font-extrabold text-green-600 mb-2">
                      {formatRupiah(product.price)}
                    </p>
                    {qty === 0 ? (
                      <button onClick={() => addToCart(product)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg
                                   bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold transition-colors">
                        <IconPlus size={13} stroke={2} /> Tambah
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-1">
                        <button onClick={() => changeQty(product._id, -1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center
                                     hover:bg-red-50 hover:border-red-300 text-gray-400 hover:text-red-500 transition-colors">
                          <IconMinus size={12} stroke={2} />
                        </button>
                        <span className="text-[14px] font-extrabold text-gray-800">{qty}</span>
                        <button onClick={() => changeQty(product._id, 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center
                                     hover:bg-green-50 hover:border-green-300 text-gray-400 hover:text-green-600 transition-colors">
                          <IconPlus size={12} stroke={2} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel kanan — keranjang */}
        <div className="bg-white border-[1.5px] border-gray-200 rounded-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <IconShoppingCart size={16} stroke={2} className="text-green-600" />
            <span className="text-[14px] font-bold text-gray-900">Keranjang</span>
            {cart.length > 0 && (
              <span className="ml-auto bg-green-100 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {totalItems} item
              </span>
            )}
          </div>

          {/* Warning produk terhapus */}
          {hasDeletedInCart && (
            <div className="mx-3 mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <IconAlertTriangle size={13} stroke={2} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                Ada produk yang sudah dihapus dari katalog. Produk ini tetap bisa disimpan.
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <IconShoppingCart size={36} stroke={1} className="text-gray-200 mb-3" />
                <p className="text-[13px] text-gray-400 font-medium">Keranjang kosong</p>
                <p className="text-[12px] text-gray-300 mt-1">Pilih produk dari katalog</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {cart.map((item) => (
                  <div key={item.product_id ?? item.product_name}
                    className={`flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 ${
                      item.deleted ? "opacity-70" : ""
                    }`}>
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex-shrink-0 overflow-hidden relative">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="36px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IconPhoto size={16} stroke={1} className="text-green-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[12px] font-semibold text-gray-800 truncate">{item.name}</p>
                        {item.deleted && (
                          <span className="text-[9px] font-bold bg-red-100 text-red-500 px-1 py-0.5 rounded flex-shrink-0">
                            DIHAPUS
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">{formatRupiah(item.price)} / item</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => changeQty(item.product_id, -1)}
                        className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center
                                   hover:bg-red-50 hover:border-red-300 text-gray-400 hover:text-red-500 transition-colors">
                        <IconMinus size={10} stroke={2} />
                      </button>
                      <span className="w-5 text-center text-[13px] font-bold text-gray-800">{item.quantity}</span>
                      <button onClick={() => changeQty(item.product_id, 1)}
                        disabled={!!item.deleted}
                        className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center
                                   hover:bg-green-50 hover:border-green-300 text-gray-400 hover:text-green-600
                                   transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <IconPlus size={10} stroke={2} />
                      </button>
                      <button onClick={() => removeFromCart(item.product_id)}
                        className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center
                                   hover:bg-red-50 hover:border-red-300 text-gray-400 hover:text-red-500 transition-colors ml-1">
                        <IconTrash size={10} stroke={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-4">
              <div className="flex flex-col gap-1 mb-3">
                {cart.map((item) => (
                  <div key={item.product_id ?? item.product_name} className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-400 truncate max-w-[160px]">
                      {item.name} ×{item.quantity}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-600">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-gray-700">Total</span>
                  <span className="text-[18px] font-extrabold text-green-600">{formatRupiah(totalPrice)}</span>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-[13px]
                           font-bold rounded-lg transition-colors disabled:opacity-60
                           flex items-center justify-center gap-1.5">
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><IconCheck size={15} stroke={2} /> Simpan Perubahan</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}