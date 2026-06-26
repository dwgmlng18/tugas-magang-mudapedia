import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Profile from "@/models/Profile";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to   = searchParams.get("to");

    const filter: Record<string, unknown> = {};
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = toDate;
      }
      filter.createdAt = dateFilter;
    }

    const transactions = await Transaction.find(filter)
      .populate("cashier_id", "email")
      .sort({ createdAt: -1 })
      .lean();

    const cashierIds = transactions
      .map((t) => (t.cashier_id as unknown as { _id: unknown })?._id)
      .filter(Boolean);

    const profiles = await Profile.find({ user_id: { $in: cashierIds as any[] } })
      .select("user_id name image")
      .lean();

    const profileMap = new Map(
      profiles.map((p) => [p.user_id.toString(), p])
    );

    const result = transactions.map((t) => {
      const cashier = t.cashier_id as unknown as { _id: any; email: string } | null;
      const profile = cashier
        ? profileMap.get(cashier._id.toString())
        : null;

      return {
        _id:         t._id,
        cashier: {
          _id:   cashier?._id ?? null,
          email: cashier?.email ?? "-",
          name:  profile?.name ?? cashier?.email ?? "Kasir",
          image: profile?.image ?? null,
        },
        total_items: t.total_items,
        total_price: t.total_price,
        createdAt:   t.createdAt,
      };
    });

    return NextResponse.json({ transactions: result });
  } catch (err) {
    console.error("GET /api/admin/transactions error:", err);
    return NextResponse.json({ message: "Gagal mengambil data." }, { status: 500 });
  }
}