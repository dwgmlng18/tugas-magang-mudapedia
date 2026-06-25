"use client";

import { useEffect, useState } from "react";
import {
  IconReceipt2,
  IconUser,
  IconCalendar,
  IconX,
  IconChevronRight,
  IconFilter,
  IconShoppingBag,
} from "@tabler/icons-react";

/* ── Types ── */
interface TransactionListItem {
  _id:         string;
  cashier:     { _id: string; name: string; email: string; image: string | null };
  total_items: number;
  total_price: number;
  createdAt:   string;
}

interface TransactionDetailItem {
  _id:      string;
  product:  { _id: string | null; name: string; image: string | null };
  quantity: number;
  price:    number;
  subtotal: number;
}

interface TransactionDetail {
  _id:         string;
  cashier:     { _id: string; name: string; email: string; image: string | null };
  total_items: number;
  total_price: number;
  createdAt:   string;
  items:       TransactionDetailItem[];
}

/* ── Helpers ── */
const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

/* ── Component ── */
export default function LaporanPage() {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading,      setLoading]      = useState(true);

  /* Filter tanggal */
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo,   setFilterTo]   = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  /* Modal detail */
  const [modalOpen,  setModalOpen]  = useState(false);
  const [detail,     setDetail]     = useState<TransactionDetail | null>(null);
  const [loadDetail, setLoadDetail] = useState(false);

  useEffect(() => { fetchTransactions(); }, []);

  /* ── Fetch list ── */
  const fetchTransactions = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to)   params.set("to",   to);
      const res  = await fetch(`/api/admin/transactions?${params.toString()}`);
      const data = await res.json();
      setTransactions(data.transactions);
    } catch {
      console.error("Gagal fetch transaksi");
    } finally {
      setLoading(false);
    }
  };

  /* ── Apply / reset filter ── */
  const applyFilter = () => {
    if (!filterFrom && !filterTo) return;
    setIsFiltered(true);
    fetchTransactions(filterFrom, filterTo);
  };

  const resetFilter = () => {
    setFilterFrom("");
    setFilterTo("");
    setIsFiltered(false);
    fetchTransactions();
  };

  /* ── Fetch detail ── */
  const openDetail = async (id: string) => {
    setModalOpen(true);
    setDetail(null);
    setLoadDetail(true);
    try {
      const res  = await fetch(`/api/admin/transactions/${id}`);
      const data = await res.json();
      setDetail(data.transaction);
    } catch {
      console.error("Gagal fetch detail");
    } finally {
      setLoadDetail(false);
    }
  };

  /* ── Render ── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900 leading-none">Laporan Transaksi</h1>
          <p className="text-[12px] text-gray-400 mt-1">
            {loading ? "Memuat..." : `${transactions.length} transaksi${isFiltered ? " (difilter)" : ""}`}
          </p>
        </div>
      </div>

      {/* Filter Tanggal */}
      <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <IconFilter size={14} stroke={2} className="text-gray-400" />
          <span className="text-[12px] font-semibold text-gray-600">Filter Tanggal</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">Dari</label>
            <input
              type="date" value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13px]
                         text-gray-800 outline-none focus:border-green-400 transition-colors"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">Sampai</label>
            <input
              type="date" value={filterTo} min={filterFrom}
              onChange={(e) => setFilterTo(e.target.value)}
              className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13px]
                         text-gray-800 outline-none focus:border-green-400 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyFilter}
              disabled={!filterFrom && !filterTo}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[13px]
                         font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              Terapkan
            </button>
            {isFiltered && (
              <button
                onClick={resetFilter}
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
      {!loading && transactions.length === 0 && (
        <div className="text-center py-24">
          <IconReceipt2 size={40} stroke={1} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">
            {isFiltered ? "Tidak ada transaksi pada rentang tanggal ini." : "Belum ada transaksi."}
          </p>
        </div>
      )}

      {/* List Transaksi */}
      {!loading && transactions.length > 0 && (
        <div className="flex flex-col gap-2">
          {transactions.map((trx) => (
            <button
              key={trx._id}
              onClick={() => openDetail(trx._id)}
              className="w-full bg-white border-[1.5px] border-gray-200 rounded-xl px-4 py-3.5
                         hover:border-green-300 hover:bg-green-50/30 transition-all text-left group"
            >
              <div className="flex items-center justify-between gap-3">

                {/* Kiri — nama kasir + tanggal (tanpa avatar) */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <IconUser size={12} stroke={2} className="text-gray-400 flex-shrink-0" />
                    <p className="text-[13px] font-bold text-gray-900 truncate">
                      {trx.cashier.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconCalendar size={11} stroke={2} className="text-gray-400 flex-shrink-0" />
                    <p className="text-[11px] text-gray-400">{formatDate(trx.createdAt)}</p>
                  </div>
                </div>

                {/* Kanan — total harga + jumlah item + chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[14px] font-extrabold text-green-600">
                      {formatRupiah(trx.total_price)}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {trx.total_items} item
                    </p>
                  </div>
                  <IconChevronRight
                    size={16} stroke={2}
                    className="text-gray-300 group-hover:text-green-500 transition-colors"
                  />
                </div>
              </div>

              {/* Baris bawah — total harga & jumlah item sebagai pill */}
              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-100">
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700
                                 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  <IconShoppingBag size={11} stroke={2} />
                  {trx.total_items} item
                </span>
                <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500
                                 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Total: {formatRupiah(trx.total_price)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Modal Detail Transaksi ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <IconReceipt2 size={18} stroke={2} className="text-green-600" />
                <h2 className="text-[16px] font-bold text-gray-900">Detail Transaksi</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
              >
                <IconX size={16} stroke={2} />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-4">

              {/* Loading detail */}
              {loadDetail && (
                <div className="flex justify-center items-center py-16">
                  <div className="w-8 h-8 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Isi detail */}
              {!loadDetail && detail && (
                <>
                  {/* Info transaksi — tanpa avatar, tanpa ID */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <IconUser size={14} stroke={2} className="text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[13px] font-bold text-gray-900 leading-none">
                          {detail.cashier.name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{detail.cashier.email}</p>
                      </div>
                    </div>

                    {/* Hanya tanggal — ID dihapus */}
                    <div>
                      <p className="text-[11px] text-gray-400 mb-0.5">Tanggal Transaksi</p>
                      <p className="text-[12px] font-semibold text-gray-800">
                        {formatDateTime(detail.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Tabel item produk */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <IconShoppingBag size={14} stroke={2} className="text-gray-400" />
                      <span className="text-[12px] font-semibold text-gray-600">
                        Item Produk ({detail.total_items} item)
                      </span>
                    </div>

                    <div className="border-[1.5px] border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left text-[11px] font-semibold text-gray-400 px-3 py-2.5">Produk</th>
                            <th className="text-center text-[11px] font-semibold text-gray-400 px-3 py-2.5">Qty</th>
                            <th className="text-right text-[11px] font-semibold text-gray-400 px-3 py-2.5">Harga</th>
                            <th className="text-right text-[11px] font-semibold text-gray-400 px-3 py-2.5">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.items.map((item) => (
                            <tr key={item._id} className="border-b border-gray-100 last:border-0">
                              <td className="px-3 py-2.5">
                                <p className={`text-[13px] font-semibold ${item.product._id ? "text-gray-800" : "text-gray-400 italic"}`}>
                                  {item.product.name}
                                </p>
                              </td>
                              <td className="px-3 py-2.5 text-center text-[13px] text-gray-600">
                                {item.quantity}
                              </td>
                              <td className="px-3 py-2.5 text-right text-[13px] text-gray-600">
                                {formatRupiah(item.price)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-[13px] font-semibold text-gray-800">
                                {formatRupiah(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-2 rounded-lg border-[1.5px] border-gray-200 text-[13px]
                           font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}