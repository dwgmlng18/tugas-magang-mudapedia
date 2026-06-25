import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
    }
    if (product.status !== "deleted") {
      return NextResponse.json({ message: "Produk ini tidak berada di sampah." }, { status: 409 });
    }

    // Cek apakah nama sudah dipakai produk lain (aktif/inaktif) setelah di-delete
    const duplicate = await Product.findOne({
      _id:    { $ne: id },
      name:   { $regex: new RegExp(`^${product.name}$`, "i") },
      status: { $ne: "deleted" },
    });
    if (duplicate) {
      return NextResponse.json(
        { message: `Nama produk "${product.name}" sudah dipakai produk lain. Ubah nama sebelum memulihkan.` },
        { status: 409 }
      );
    }

    const restored = await Product.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true }
    ).populate("category_id", "name");

    return NextResponse.json({ product: restored });
  } catch (err) {
    console.error("PATCH /api/admin/products/[id]/restore error:", err);
    return NextResponse.json({ message: "Gagal memulihkan produk." }, { status: 500 });
  }
}