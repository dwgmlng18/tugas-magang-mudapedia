import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import TransactionDetail from "@/models/TransactionDetail";
import Profile from "@/models/Profile";
import mongoose from "mongoose";

/* GET /api/admin/transactions/[id] — detail 1 transaksi beserta item produknya */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    // Ambil transaksi + populate cashier
    const transaction = await Transaction.findById(id)
      .populate("cashier_id", "email")
      .lean();

    if (!transaction) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    // Ambil profile kasir
    const cashier = transaction.cashier_id as { _id: unknown; email: string } | null;
    const profile = cashier
      ? await Profile.findOne({ user_id: cashier._id }).select("name image").lean()
      : null;

    // Ambil detail item, populate nama produk
    const details = await TransactionDetail.find({ transaction_id: id })
      .populate("product_id", "name image")
      .lean();

    const items = details.map((d) => {
      const product = d.product_id as { _id: unknown; name: string; image?: string } | null;
      return {
        _id:      d._id,
        product: {
          _id:   product?._id ?? null,
          name:  product?.name ?? "Produk dihapus",
          image: product?.image ?? null,
        },
        quantity: d.quantity,
        price:    d.price,
        subtotal: d.subtotal,
      };
    });

    return NextResponse.json({
      transaction: {
        _id:         transaction._id,
        cashier: {
          _id:   cashier?._id ?? null,
          email: cashier?.email ?? "-",
          name:  profile?.name ?? cashier?.email ?? "Kasir",
          image: profile?.image ?? null,
        },
        total_items: transaction.total_items,
        total_price: transaction.total_price,
        createdAt:   transaction.createdAt,
        items,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/transactions/[id] error:", err);
    return NextResponse.json({ message: "Gagal mengambil detail transaksi." }, { status: 500 });
  }
}