import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import TransactionDetail from "@/models/TransactionDetail";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

/* GET /api/kasir/transactions/[id] */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const transaction = await Transaction.findOne({
      _id:        id,
      cashier_id: session.user.id,
    }).lean();

    if (!transaction) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    const details = await TransactionDetail.find({ transaction_id: id })
      .populate("product_id", "name price image status")
      .lean();

    const items = details.map((d) => {
      const p = d.product_id as unknown as {
        _id: unknown; name: string; price: number; image?: string; status?: string;
      } | null;

      const isSoftDeleted = p?.status === "deleted";
      const isPermanentlyDeleted = !p;

      return {
        _id:          d._id,
        product_id:   p?._id ?? null,
        // Pakai nama produk saat ini jika masih ada, fallback ke snapshot product_name
        name:         p?.name ?? d.product_name ?? "Produk dihapus",
        price:        d.price,
        image:        p?.image ?? null,
        quantity:     d.quantity,
        subtotal:     d.subtotal,
        deleted:      isSoftDeleted || isPermanentlyDeleted, // flag: produk sudah dihapus dari katalog
        isPermanent:  isPermanentlyDeleted, // flag: produk dihapus permanen
      };
    });

    return NextResponse.json({ transaction: { ...transaction, items } });
  } catch (err) {
    console.error("GET /api/kasir/transactions/[id] error:", err);
    return NextResponse.json({ message: "Gagal mengambil detail." }, { status: 500 });
  }
}

/* PUT /api/kasir/transactions/[id] */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const transaction = await Transaction.findOne({
      _id:        id,
      cashier_id: session.user.id,
    });

    if (!transaction) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    const body = await req.json();
    const { items } = body as {
      items: {
        product_id: string | null;
        product_name?: string;
        quantity: number;
        price: number;
        subtotal: number;
      }[];
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "Transaksi harus memiliki minimal 1 produk." },
        { status: 400 }
      );
    }

    // Resolve product_name if missing from payload
    const productIds = items.map((i) => i.product_id).filter(Boolean);
    const productsList = await Product.find({ _id: { $in: productIds } }).select("name").lean();
    const productMap = new Map(productsList.map((p) => [p._id.toString(), p.name]));

    const total_items = items.reduce((sum, i) => sum + i.quantity, 0);
    const total_price = items.reduce((sum, i) => sum + i.subtotal, 0);

    transaction.total_items = total_items;
    transaction.total_price = total_price;
    transaction.createdAt   = new Date();
    await transaction.save();

    await TransactionDetail.deleteMany({ transaction_id: id });
    await TransactionDetail.insertMany(
      items.map((i) => ({
        transaction_id: transaction._id,
        product_id:     i.product_id || null,
        product_name:   i.product_name || (i.product_id ? productMap.get(i.product_id.toString()) : undefined) || "Produk",
        quantity:       i.quantity,
        price:          i.price,
        subtotal:       i.subtotal,
      }))
    );

    return NextResponse.json({ transaction });
  } catch (err) {
    console.error("PUT /api/kasir/transactions/[id] error:", err);
    return NextResponse.json({ message: "Gagal memperbarui transaksi." }, { status: 500 });
  }
}

/* DELETE /api/kasir/transactions/[id] */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id:        id,
      cashier_id: session.user.id,
    });

    if (!transaction) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    await TransactionDetail.deleteMany({ transaction_id: id });

    return NextResponse.json({ message: "Transaksi berhasil dihapus." });
  } catch (err) {
    console.error("DELETE /api/kasir/transactions/[id] error:", err);
    return NextResponse.json({ message: "Gagal menghapus transaksi." }, { status: 500 });
  }
}