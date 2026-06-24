import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

/* GET /api/categories — ambil semua kategori */
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

/* POST /api/categories — tambah kategori baru */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Nama kategori tidak boleh kosong." }, { status: 400 });
    }

    /* Cek duplikat nama (case-insensitive) */
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return NextResponse.json({ message: "Nama kategori sudah digunakan." }, { status: 409 });
    }

    const category = await Category.create({ name: name.trim() });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Gagal menyimpan kategori." }, { status: 500 });
  }
}