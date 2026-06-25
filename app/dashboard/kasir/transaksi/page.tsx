"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconPlus, IconEdit, IconTrash, IconReceipt2,
  IconCalendar, IconShoppingCart,
  IconEye, IconUser, IconX, IconPhoto, IconAlertTriangle,
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

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const formatDateTimeLong = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });

const BADGE_COLORS = [
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

/* ─── Modal Detail ───────────────────────────────────────── */
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

  // Tutup modal saat klik backdrop
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl
                   shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">Detail Transaksi</h2>
            {detail && (
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                #{String(detail._id).slice(-8).toUpperCase()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       border border-gray-200 hover:bg-gray-50 transition-colors text-gray-400"
          >
            <IconX size={15} stroke={2} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1">
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
              {/* Total card */}
              <div className="bg-green-600 mx-4 mt-4 rounded-xl px-4 py-4 text-white">
                <p className="text-[11px] font-semibold text-green-200 mb-1">Total Pembayaran</p>
                <p className="text-[28px] font-extrabold leading-none mb-3">
                  {formatRupiah(detail.total_price)}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-green-100">
                  <div className="flex items-center gap-1">
                    <IconCalendar size={12} stroke={2} />
                    <span>{formatDateTimeLong(detail.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-green-100">
                  <IconShoppingCart size={12} stroke={2} />
                  <span>{detail.total_items} item dibeli</span>
                </div>
              </div>

              {/* Warning produk terhapus */}
              {hasDeleted && (
                <div className="mx-4 mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200
                                rounded-xl px-3 py-2.5">
                  <IconAlertTriangle size={14} stroke={2} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    Beberapa produk sudah dihapus dari katalog. Nama tetap ditampilkan dari data saat transaksi dibuat.
                  </p>
                </div>
              )}

              {/* Daftar produk */}
              <div className="mx-4 mt-3 mb-4 bg-white border-[1.5px] border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                  <IconShoppingCart size={13} stroke={2} className="text-green-600" />
                  <span className="text-[12px] font-bold text-gray-800">Produk</span>
                  <span className="ml-auto bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {detail.items.length} jenis
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {detail.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 px-4 py-3">
                      {/* Gambar */}
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
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-[12px] font-semibold truncate ${item.deleted ? "text-gray-400" : "text-gray-800"}`}>
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
                      {/* Subtotal */}
                      <p className="text-[13px] font-extrabold text-green-600 flex-shrink-0">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total row */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100
                                flex justify-between items-center">
                  <span className="text-[12px] font-bold text-gray-700">Total</span>
                  <span className="text-[16px] font-extrabold text-green-600">
                    {formatRupiah(detail.total_price)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer aksi */}
        {!loading && detail && (
          <div className="px-4 py-3.5 border-t border-gray-100 flex gap-2 flex-shrink-0">
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
    if (dateFrom && d < new Date(dateFrom + "T00:00:00")) return false;
    if (dateTo   && d > new Date(dateTo   + "T23:59:59")) return false;
    return true;
  });

  const clearFilter = () => { setDateFrom(""); setDateTo(""); };

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900 leading-none">Transaksi Saya</h1>
            <p className="text-[12px] text-gray-400 mt-1">
              {loading ? "Memuat..." : `${filtered.length} transaksi ditemukan`}
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

        {/* Filter tanggal */}
        {!loading && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <IconCalendar size={14} stroke={2} className="text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border-[1.5px] border-gray-200 rounded-lg px-3 py-1.5 text-[12px]
                         text-gray-700 outline-none focus:border-green-400 transition-colors
                         cursor-pointer"
            />
            <span className="text-[12px] text-gray-400 font-medium">sampai</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="border-[1.5px] border-gray-200 rounded-lg px-3 py-1.5 text-[12px]
                         text-gray-700 outline-none focus:border-green-400 transition-colors
                         cursor-pointer"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={clearFilter}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-400
                           hover:text-red-500 transition-colors"
              >
                <IconX size={12} stroke={2} />
                Reset
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-9 h-9 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Kosong */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <IconReceipt2 size={48} stroke={1} className="text-gray-200 mx-auto mb-3" />
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

        {/* List */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {filtered.map((trx, idx) => (
              <div
                key={trx._id}
                className="bg-white border-[1.5px] border-gray-200 rounded-xl px-4 py-3.5
                           hover:border-green-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Kiri */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
                                     text-[12px] font-extrabold ${BADGE_COLORS[idx % BADGE_COLORS.length]}`}>
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-extrabold text-green-600">
                        {formatRupiah(trx.total_price)}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <IconUser size={10} stroke={2} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[11px] text-gray-500 font-medium truncate max-w-[120px]">
                          {trx.cashier_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500
                                         text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                          <IconShoppingCart size={9} stroke={2} />
                          {trx.total_items} item
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                        <div className="flex items-center gap-1">
                          <IconCalendar size={10} stroke={2} className="text-gray-400" />
                          <span className="text-[11px] text-gray-400">{formatDateTime(trx.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kanan — aksi */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setDetailId(trx._id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                                 hover:bg-blue-50 hover:border-blue-300 transition-colors
                                 text-gray-400 hover:text-blue-500"
                      title="Detail"
                    >
                      <IconEye size={14} stroke={2} />
                    </button>
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