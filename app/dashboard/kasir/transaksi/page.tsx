"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconPlus, IconEdit, IconTrash, IconReceipt2,
  IconCalendar, IconShoppingCart, IconFilter,
  IconUser, IconX, IconPhoto, IconAlertTriangle,
} from "@tabler/icons-react";

/* ─── Types ─────────────────────────────────────────────── */
interface TransactionItem {
  _id:          string;
  cashier_name: string;
  total_items:  number;
  total_price:  number;
  createdAt:    string;
}

interface DetailItem {
  _id:        string;
  product_id: string | null;
  name:       string;
  price:      number;
  image:      string | null;
  quantity:   number;
  subtotal:   number;
  deleted:    boolean;
}

interface TransactionDetail {
  _id:         string;
  total_items: number;
  total_price: number;
  createdAt:   string;
  items:       DetailItem[];
}

/* ─── Helpers ────────────────────────────────────────────── */
const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const formatDateTimeLong = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });

/* ─── Modal Detail — tampilan disamakan dengan Laporan Transaksi ─── */
function DetailModal({
  trxId,
  onClose,
  onDelete,
}: {
  trxId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [detail,   setDetail]   = useState<TransactionDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/kasir/transactions/${trxId}`)
      .then((r) => r.json())
      .then((data) => setDetail(data.transaction ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [trxId]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Aksi hapus — biarkan sesuai (sudah pas)
  const handleDelete = async () => {
    if (!confirm("Hapus transaksi ini? Semua item di dalamnya juga akan dihapus.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/kasir/transactions/${trxId}`, { method: "DELETE" });
      if (res.ok) {
        onDelete(trxId);
        onClose();
      }
    } catch { console.error("Gagal hapus"); }
    finally { setDeleting(false); }
  };

  const hasDeleted = detail?.items.some((i) => i.deleted) ?? false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">

        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <IconReceipt2 size={18} stroke={2} className="text-green-600" />
            <div>
              <h2 className="text-[16px] font-bold text-gray-900 leading-none">Detail Transaksi</h2>
              {detail && (
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  #{String(detail._id).slice(-8).toUpperCase()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
          >
            <IconX size={16} stroke={2} />
          </button>
        </div>

        {/* Modal body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="w-8 h-8 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && !detail && (
            <div className="text-center py-16">
              <IconReceipt2 size={40} stroke={1} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Transaksi tidak ditemukan.</p>
            </div>
          )}

          {!loading && detail && (
            <>
              {/* Info transaksi */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <IconShoppingCart size={14} stroke={2} className="text-gray-400 flex-shrink-0" />
                  <p className="text-[13px] font-bold text-gray-900 leading-none">
                    {detail.total_items} item dibeli
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Tanggal Transaksi</p>
                  <p className="text-[12px] font-semibold text-gray-800">
                    {formatDateTimeLong(detail.createdAt)}
                  </p>
                </div>
              </div>

              {/* Peringatan produk terhapus */}
              {hasDeleted && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
                  <IconAlertTriangle size={14} stroke={2} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    Beberapa produk sudah dihapus dari katalog. Nama tetap ditampilkan dari data saat transaksi dibuat.
                  </p>
                </div>
              )}

              {/* Tabel / daftar item produk */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <IconShoppingCart size={14} stroke={2} className="text-gray-400" />
                  <span className="text-[12px] font-semibold text-gray-600">
                    Item Produk ({detail.items.length} jenis)
                  </span>
                </div>

                <div className="border-[1.5px] border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {detail.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 px-4 py-3 bg-white">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100
                                      flex-shrink-0 overflow-hidden relative">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IconPhoto size={16} stroke={1} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-[13px] font-semibold truncate ${item.deleted ? "text-gray-400" : "text-gray-800"}`}>
                            {item.name}
                          </p>
                          {item.deleted && (
                            <span className="text-[9px] font-bold bg-red-100 text-red-500
                                             px-1.5 py-0.5 rounded flex-shrink-0">
                              DIHAPUS
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {formatRupiah(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-[13px] font-extrabold text-green-600 flex-shrink-0">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-green-50 border-[1.5px] border-green-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <p className="text-[13px] font-bold text-gray-700">Total Pembayaran</p>
                <p className="text-[18px] font-extrabold text-green-600">
                  {formatRupiah(detail.total_price)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer aksi — biarkan sesuai (sudah ada tampilannya sendiri) */}
        {!loading && detail && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200
                         hover:bg-red-50 hover:border-red-300 transition-colors
                         text-gray-500 hover:text-red-500 text-[12px] font-semibold
                         disabled:opacity-60"
            >
              <IconTrash size={13} stroke={2} />
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
            <Link
              href={`/dashboard/kasir/transaksi/${trxId}/edit`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                         bg-green-600 hover:bg-green-700 transition-colors
                         text-white text-[13px] font-bold"
            >
              <IconEdit size={14} stroke={2} />
              Edit Transaksi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page Utama ─────────────────────────────────────────── */
export default function KasirTransaksiPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [detailId,     setDetailId]     = useState<string | null>(null);
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [appliedFrom,  setAppliedFrom]  = useState("");
  const [appliedTo,    setAppliedTo]    = useState("");
  const [isFiltered,   setIsFiltered]   = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/kasir/transactions");
      const data = await res.json();
      setTransactions(data.transactions ?? []);
    } catch {
      console.error("Gagal fetch transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromList = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  const filtered = transactions.filter((t) => {
    const d = new Date(t.createdAt);
    if (appliedFrom && d < new Date(appliedFrom + "T00:00:00")) return false;
    if (appliedTo   && d > new Date(appliedTo   + "T23:59:59")) return false;
    return true;
  });

  const applyFilter = () => {
    if (!dateFrom && !dateTo) return;
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
    setIsFiltered(true);
  };

  const clearFilter = () => {
    setDateFrom("");
    setDateTo("");
    setAppliedFrom("");
    setAppliedTo("");
    setIsFiltered(false);
  };

  return (
    <>
      <div>
        {/* Header — biarkan sesuai */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900 leading-none">Transaksi Saya</h1>
            <p className="text-[12px] text-gray-400 mt-1">
              {loading ? "Memuat..." : `${filtered.length} transaksi${isFiltered ? " (difilter)" : ""}`}
            </p>
          </div>
          <Link
            href="/dashboard/kasir/transaksi/tambah"
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white
                       text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <IconPlus size={16} stroke={2} />
            Tambah Transaksi
          </Link>
        </div>

        {/* Filter Tanggal — disamakan dengan Laporan Transaksi */}
        <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <IconFilter size={14} stroke={2} className="text-gray-400" />
            <span className="text-[12px] font-semibold text-gray-600">Filter Tanggal</span>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Dari</label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13px]
                           text-gray-800 outline-none focus:border-green-400 transition-colors"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Sampai</label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13px]
                           text-gray-800 outline-none focus:border-green-400 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyFilter}
                disabled={!dateFrom && !dateTo}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[13px]
                           font-semibold rounded-lg transition-colors disabled:opacity-40"
              >
                Terapkan
              </button>
              {isFiltered && (
                <button
                  onClick={clearFilter}
                  className="px-4 py-2 border-[1.5px] border-gray-200 text-gray-500 text-[13px]
                             font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
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
            <IconReceipt2 size={40} stroke={1} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium mb-4">
              {transactions.length === 0
                ? "Belum ada transaksi."
                : "Tidak ada transaksi dalam rentang tanggal ini."}
            </p>
            {transactions.length === 0 && (
              <Link
                href="/dashboard/kasir/transaksi/tambah"
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white
                           text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <IconPlus size={15} stroke={2} />
                Buat Transaksi Pertama
              </Link>
            )}
          </div>
        )}

        {/* List — disamakan dengan tampilan per-item Laporan Transaksi */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {filtered.map((trx) => (
              <div
                key={trx._id}
                role="button"
                tabIndex={0}
                onClick={() => setDetailId(trx._id)}
                onKeyDown={(e) => { if (e.key === "Enter") setDetailId(trx._id); }}
                className="w-full bg-white border-[1.5px] border-gray-200 rounded-xl px-4 py-3.5
                           hover:border-green-300 hover:bg-green-50/30 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">

                  {/* Kiri — nama kasir + tanggal */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <IconUser size={12} stroke={2} className="text-gray-400 flex-shrink-0" />
                      <p className="text-[13px] font-bold text-gray-900 truncate">
                        {trx.cashier_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconCalendar size={11} stroke={2} className="text-gray-400 flex-shrink-0" />
                      <p className="text-[11px] text-gray-400">{formatDate(trx.createdAt)}</p>
                    </div>
                  </div>

                  {/* Kanan — total + item, lalu aksi edit/hapus (biarkan sesuai) */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[14px] font-extrabold text-green-600">
                        {formatRupiah(trx.total_price)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {trx.total_items} item
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/dashboard/kasir/transaksi/${trx._id}/edit`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                                   hover:bg-green-50 hover:border-green-300 transition-colors
                                   text-gray-400 hover:text-green-600"
                        title="Edit"
                      >
                        <IconEdit size={14} stroke={2} />
                      </Link>
                      <button
                        onClick={async () => {
                          if (!confirm("Hapus transaksi ini? Semua item di dalamnya juga akan dihapus.")) return;
                          const res = await fetch(`/api/kasir/transactions/${trx._id}`, { method: "DELETE" });
                          if (res.ok) setTransactions((prev) => prev.filter((t) => t._id !== trx._id));
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                                   hover:bg-red-50 hover:border-red-300 transition-colors
                                   text-gray-400 hover:text-red-500"
                        title="Hapus"
                      >
                        <IconTrash size={14} stroke={2} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Baris bawah — total & jumlah item sebagai pill */}
                <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700
                                   text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    <IconShoppingCart size={11} stroke={2} />
                    {trx.total_items} item
                  </span>
                  <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500
                                   text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    Total: {formatRupiah(trx.total_price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {detailId && (
        <DetailModal
          trxId={detailId}
          onClose={() => setDetailId(null)}
          onDelete={handleDeleteFromList}
        />
      )}
    </>
  );
}