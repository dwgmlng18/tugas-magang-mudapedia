import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const formData    = await req.formData();
    const name        = formData.get("name")        as string | null;
    const category_id = formData.get("category_id") as string | null;
    const price       = formData.get("price")       as string | null;
    const description = formData.get("description") as string | null;
    const status      = formData.get("status")      as string | null;
    const imageFile   = formData.get("image")       as File   | null;

    if (!name?.trim()) {
      return NextResponse.json({ message: "Nama produk tidak boleh kosong." }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ message: "Kategori harus dipilih." }, { status: 400 });
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ message: "Harga tidak valid." }, { status: 400 });
    }
    if (status && !["active", "inactive"].includes(status)) {
      return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
    }

    const existing = await Product.findById(id);
    if (!existing) {
      return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
    }
    // Tolak edit produk yang sudah deleted
    if (existing.status === "deleted") {
      return NextResponse.json({ message: "Produk yang sudah dihapus tidak dapat diedit." }, { status: 409 });
    }

    const nameChanged = name.trim().toLowerCase() !== existing.name.toLowerCase();
    if (nameChanged) {
      const duplicate = await Product.findOne({
        _id:    { $ne: id },
        name:   { $regex: new RegExp(`^${name.trim()}$`, "i") },
        status: { $ne: "deleted" },
      });
      if (duplicate) {
        return NextResponse.json({ message: "Nama produk sudah digunakan." }, { status: 409 });
      }
    }

    const update: Record<string, unknown> = {
      name:        name.trim(),
      category_id,
      price:       Number(price),
      description: description?.trim() || null,
      status:      status ?? existing.status,
    };

    if (imageFile && imageFile.size > 0) {
      if (existing.image) {
        await deleteFromCloudinary(existing.image);
      }
      const bytes  = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      update.image = await uploadToCloudinary(buffer);
    }

    const product = await Product.findByIdAndUpdate(id, update, { new: true })
      .populate("category_id", "name");

    return NextResponse.json({ product });
  } catch (err) {
    console.error("PUT /api/admin/products/[id] error:", err);
    return NextResponse.json({ message: "Gagal memperbarui produk." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 * SOFT DELETE — set status = "deleted", gambar TIDAK dihapus dari Cloudinary.
 * Untuk hapus permanen gunakan DELETE /api/admin/products/[id]/permanent
 */
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
    if (product.status === "deleted") {
      return NextResponse.json({ message: "Produk sudah dihapus sebelumnya." }, { status: 409 });
    }

    await Product.findByIdAndUpdate(id, { status: "deleted" });

    return NextResponse.json({ message: "Produk berhasil dipindahkan ke sampah." });
  } catch (err) {
    console.error("DELETE /api/admin/products/[id] error:", err);
    return NextResponse.json({ message: "Gagal menghapus produk." }, { status: 500 });
  }
}