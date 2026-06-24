"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
  IconPhoto,
  IconUpload,
} from "@tabler/icons-react";

/* ── Types ── */
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
  status:       "active" | "inactive";
  category_id:  { _id: string; name: string } | null;
  createdAt:    string;
}

/* ── Helpers ── */
const formatRupiah = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style:                 "currency",
    currency:              "IDR",
    minimumFractionDigits: 0,
  }).format(price);

/* ── Component ── */
export default function AdminProdukPage() {
  const [products,       setProducts]       = useState<Product[]>([]);
  const [categories,     setCategories]     = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("semua");
  const [loading,        setLoading]        = useState(true);

  /* Modal state */
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  /* Form fields */
  const [formName,       setFormName]       = useState("");
  const [formCategory,   setFormCategory]   = useState("");
  const [formPrice,      setFormPrice]      = useState("");
  const [formDesc,       setFormDesc]       = useState("");
  const [formStatus,     setFormStatus]     = useState<"active" | "inactive">("active");
  const [formImageFile,  setFormImageFile]  = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  /* ── Fetch ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products);
      setCategories(data.categories);
    } catch {
      console.error("Gagal fetch produk");
    } finally {
      setLoading(false);
    }
  };

  /* ── Filter ── */
  const filtered =
    activeCategory === "semua"
      ? products
      : products.filter((p) => p.category_id?._id === activeCategory);

  /* ── Reset form ── */
  const resetForm = () => {
    setFormName("");
    setFormCategory(categories[0]?._id ?? "");
    setFormPrice("");
    setFormDesc("");
    setFormStatus("active");
    setFormImageFile(null);
    setFormImagePreview(null);
    setError("");
  };

  /* ── Open modal tambah ── */
  const openAdd = () => {
    setEditTarget(null);
    resetForm();
    setModalOpen(true);
  };

  /* ── Open modal edit ── */
  const openEdit = (product: Product) => {
    setEditTarget(product);
    setFormName(product.name);
    setFormCategory(product.category_id?._id ?? "");
    setFormPrice(String(product.price));
    setFormDesc(product.description ?? "");
    setFormStatus(product.status);
    setFormImageFile(null);
    setFormImagePreview(product.image ?? null);
    setError("");
    setModalOpen(true);
  };

  /* ── Handle pilih gambar ── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormImageFile(file);
    // Buat preview URL sementara di browser
    setFormImagePreview(URL.createObjectURL(file));
  };

  /* ── Save (tambah / edit) ── */
  const handleSave = async () => {
    if (!formName.trim())  { setError("Nama produk tidak boleh kosong.");  return; }
    if (!formCategory)     { setError("Kategori harus dipilih.");          return; }
    if (!formPrice.trim() || isNaN(Number(formPrice)) || Number(formPrice) < 0) {
      setError("Harga tidak valid."); return;
    }

    setSaving(true);
    setError("");

    try {
      // Kirim sebagai FormData karena ada kemungkinan upload gambar
      const fd = new FormData();
      fd.append("name",        formName.trim());
      fd.append("category_id", formCategory);
      fd.append("price",       formPrice);
      fd.append("description", formDesc.trim());
      fd.append("status",      formStatus);
      if (formImageFile) fd.append("image", formImageFile);

      if (editTarget) {
        /* Edit */
        const res = await fetch(`/api/admin/products/${editTarget._id}`, {
          method: "PUT",
          body:   fd,
        });
        if (!res.ok) { const d = await res.json(); setError(d.message || "Gagal menyimpan."); return; }
        const { product } = await res.json();
        setProducts((prev) => prev.map((p) => (p._id === product._id ? product : p)));
      } else {
        /* Tambah */
        const res = await fetch("/api/admin/products", { method: "POST", body: fd });
        if (!res.ok) { const d = await res.json(); setError(d.message || "Gagal menyimpan."); return; }
        const { product } = await res.json();
        setProducts((prev) => [product, ...prev]);
      }

      setModalOpen(false);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini? Data transaksi yang sudah ada tidak akan terpengaruh.")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      console.error("Gagal hapus produk");
    }
  };

  /* ── Render ── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900 leading-none">Manajemen Produk</h1>
          <p className="text-[12px] text-gray-400 mt-1">
            {loading ? "Memuat..." : `${filtered.length} produk ditampilkan`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white
                     text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <IconPlus size={16} stroke={2} />
          Tambah Produk
        </button>
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
          <p className="text-gray-400 text-sm font-medium">Belum ada produk.</p>
        </div>
      )}

      {/* Grid Produk — tampilan kartu seperti katalog */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl border-[1.5px] border-gray-200 overflow-hidden flex flex-col"
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
                    <IconPhoto size={40} stroke={1} className="text-green-200" />
                  </div>
                )}

                {/* Badge status — pojok kanan atas */}
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  product.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}>
                  {product.status === "active" ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-[11px] font-bold text-green-600 uppercase tracking-wide mb-0.5">
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
                <p className="text-[15px] font-extrabold text-green-600 mt-auto mb-3">
                  {formatRupiah(product.price)}
                </p>

                {/* Tombol aksi */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg
                               border border-gray-200 hover:bg-green-50 hover:border-green-300
                               text-gray-400 hover:text-green-600 transition-colors text-[12px] font-semibold"
                  >
                    <IconEdit size={14} stroke={2} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg
                               border border-gray-200 hover:bg-red-50 hover:border-red-300
                               text-gray-400 hover:text-red-500 transition-colors text-[12px] font-semibold"
                  >
                    <IconTrash size={14} stroke={2} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Tambah / Edit ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-gray-900">
                {editTarget ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
              >
                <IconX size={16} stroke={2} />
              </button>
            </div>

            {/* Upload Gambar */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Gambar Produk
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl border-[1.5px] border-dashed border-gray-200
                           bg-gray-50 flex items-center justify-center cursor-pointer
                           hover:border-green-400 hover:bg-green-50 transition-colors overflow-hidden relative"
              >
                {formImagePreview ? (
                  <Image
                    src={formImagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={formImageFile !== null} /* preview lokal tidak perlu optimasi */
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <IconUpload size={28} stroke={1.5} />
                    <p className="text-[12px] font-medium">Klik untuk upload gambar</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {formImagePreview && (
                <button
                  onClick={() => { setFormImageFile(null); setFormImagePreview(null); }}
                  className="mt-1.5 text-[11px] text-red-400 hover:text-red-600 font-medium"
                >
                  Hapus gambar
                </button>
              )}
            </div>

            {/* Nama */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Nama Produk <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Nasi Goreng Spesial"
                className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13px]
                           text-gray-800 placeholder-gray-300 outline-none focus:border-green-400 transition-colors"
              />
            </div>

            {/* Kategori */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Kategori <span className="text-red-400">*</span>
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13px]
                           text-gray-800 outline-none focus:border-green-400 transition-colors bg-white"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Harga */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Harga (Rp) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="Contoh: 15000"
                min={0}
                className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13px]
                           text-gray-800 placeholder-gray-300 outline-none focus:border-green-400 transition-colors"
              />
            </div>

            {/* Deskripsi */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Deskripsi <span className="text-gray-300 font-normal">(opsional)</span>
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Deskripsi singkat produk..."
                rows={3}
                className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13px]
                           text-gray-800 placeholder-gray-300 outline-none focus:border-green-400
                           transition-colors resize-none"
              />
            </div>

            {/* Status */}
            <div className="mb-5">
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Status
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormStatus("active")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold transition-colors ${
                    formStatus === "active"
                      ? "bg-green-50 border-green-400 text-green-700"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${formStatus === "active" ? "bg-green-500" : "bg-gray-300"}`} />
                  Aktif
                </button>
                <button
                  onClick={() => setFormStatus("inactive")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold transition-colors ${
                    formStatus === "inactive"
                      ? "bg-gray-100 border-gray-400 text-gray-700"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${formStatus === "inactive" ? "bg-gray-500" : "bg-gray-300"}`} />
                  Nonaktif
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-500 mb-4 -mt-2">{error}</p>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-lg border-[1.5px] border-gray-200 text-[13px]
                           font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white
                           text-[13px] font-semibold transition-colors disabled:opacity-60
                           flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><IconCheck size={15} stroke={2} /> Simpan</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}