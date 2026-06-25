import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import mongoose from "mongoose";

export async function DELETE(
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
      return NextResponse.json(
        { message: "Hapus permanen hanya bisa dilakukan pada produk di sampah." },
        { status: 409 }
      );
    }

    await Product.findByIdAndDelete(id);

    // Hapus gambar dari Cloudinary — tidak throw jika gagal
    if (product.image) {
      try {
        await deleteFromCloudinary(product.image);
      } catch (e) {
        console.warn("Gagal hapus gambar dari Cloudinary:", e);
      }
    }

    return NextResponse.json({ message: "Produk berhasil dihapus permanen." });
  } catch (err) {
    console.error("DELETE /api/admin/products/[id]/permanent error:", err);
    return NextResponse.json({ message: "Gagal menghapus produk secara permanen." }, { status: 500 });
  }
}