"use client";

import { useEffect, useState } from "react";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
  IconSearch,
} from "@tabler/icons-react";

interface Category {
  _id:       string;
  name:      string;
  status:    "active" | "inactive";
  createdAt: string;
}

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");

  /* Modal state */
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [formName,   setFormName]   = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => { fetchCategories(); }, []);

  /* ── Fetch ── */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories);
    } catch {
      console.error("Gagal fetch kategori");
    } finally {
      setLoading(false);
    }
  };

  /* ── Filter pencarian nama ── */
  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Open modal tambah ── */
  const openAdd = () => {
    setEditTarget(null);
    setFormName("");
    setFormStatus("active");
    setError("");
    setModalOpen(true);
  };

  /* ── Open modal edit ── */
  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setFormName(cat.name);
    setFormStatus(cat.status);
    setError("");
    setModalOpen(true);
  };

  /* ── Save (tambah / edit) ── */
  const handleSave = async () => {
    if (!formName.trim()) { setError("Nama kategori tidak boleh kosong."); return; }
    setSaving(true);
    setError("");
    try {
      if (editTarget) {
        const res = await fetch(`/api/admin/categories/${editTarget._id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ name: formName.trim(), status: formStatus }),
        });
        if (!res.ok) { const d = await res.json(); setError(d.message || "Gagal menyimpan."); return; }
        const { category } = await res.json();
        setCategories((prev) => prev.map((c) => (c._id === category._id ? category : c)));
      } else {
        const res = await fetch("/api/admin/categories", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ name: formName.trim() }),
        });
        if (!res.ok) { const d = await res.json(); setError(d.message || "Gagal menyimpan."); return; }
        const { category } = await res.json();
        setCategories((prev) => [category, ...prev]);
      }
      setModalOpen(false);
    } catch {
      setError("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini? Produk yang terkait tidak akan ikut terhapus.")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch {
      console.error("Gagal hapus kategori");
    }
  };

  /* ── Render ── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900 leading-none">Manajemen Kategori</h1>
          <p className="text-[12px] text-gray-400 mt-1">
            {loading ? "Memuat..." : `${filtered.length} kategori ditemukan`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white
                     text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <IconPlus size={16} stroke={2} />
          Tambah Kategori
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <IconSearch
          size={15}
          stroke={2}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama kategori..."
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
            {search ? `Tidak ada kategori dengan nama "${search}".` : "Belum ada kategori."}
          </p>
        </div>
      )}

      {/* Tabel */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white border-[1.5px] border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[12px] font-semibold text-gray-500 px-4 py-3 w-8">#</th>
                <th className="text-left text-[12px] font-semibold text-gray-500 px-4 py-3">Nama Kategori</th>
                <th className="text-left text-[12px] font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-[12px] font-semibold text-gray-500 px-4 py-3">Dibuat</th>
                <th className="text-right text-[12px] font-semibold text-gray-500 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, i) => (
                <tr key={cat._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-gray-800">{cat.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border ${
                      cat.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                      {cat.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-400">
                    {new Date(cat.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(cat)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                                   hover:bg-green-50 hover:border-green-300 transition-colors text-gray-400 hover:text-green-600"
                        title="Edit"
                      >
                        <IconEdit size={15} stroke={2} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                                   hover:bg-red-50 hover:border-red-300 transition-colors text-gray-400 hover:text-red-500"
                        title="Hapus"
                      >
                        <IconTrash size={15} stroke={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Tambah / Edit ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-gray-900">
                {editTarget ? "Edit Kategori" : "Tambah Kategori"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
              >
                <IconX size={16} stroke={2} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Nama Kategori
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="Contoh: Makanan, Minuman..."
                className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13px]
                           text-gray-800 placeholder-gray-300 outline-none focus:border-green-400 transition-colors"
              />
              {error && <p className="text-[12px] text-red-500 mt-1.5">{error}</p>}
            </div>

            {editTarget && (
              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Status</label>
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
            )}

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