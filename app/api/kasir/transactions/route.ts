import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import TransactionDetail from "@/models/TransactionDetail";
import Profile from "@/models/Profile";
import { auth } from "@/lib/auth";

/* GET /api/kasir/transactions */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const transactions = await Transaction.find({ cashier_id: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const profile = await Profile.findOne({ user_id: session.user.id })
      .select("name")
      .lean();

    const result = transactions.map((t) => ({
      _id:         t._id,
      cashier_name: profile?.name ?? "Kasir",
      total_items: t.total_items,
      total_price: t.total_price,
      createdAt:   t.createdAt,
    }));

    return NextResponse.json({ transactions: result });
  } catch (err) {
    console.error("GET /api/kasir/transactions error:", err);
    return NextResponse.json({ message: "Gagal mengambil data." }, { status: 500 });
  }
}

/* POST /api/kasir/transactions */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { items } = body as {
      items: {
        product_id: string;
        product_name: string;
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

    const total_items = items.reduce((sum, i) => sum + i.quantity, 0);
    const total_price = items.reduce((sum, i) => sum + i.subtotal, 0);

    const transaction = await Transaction.create({
      cashier_id: session.user.id,
      total_items,
      total_price,
    });

    await TransactionDetail.insertMany(
      items.map((i) => ({
        transaction_id: transaction._id,
        product_id:     i.product_id || null,
        product_name:   i.product_name,
        quantity:       i.quantity,
        price:          i.price,
        subtotal:       i.subtotal,
      }))
    );

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err) {
    console.error("POST /api/kasir/transactions error:", err);
    return NextResponse.json({ message: "Gagal menyimpan transaksi." }, { status: 500 });
  }
}