import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import mongoose from "mongoose";

/* PUT /api/categories/[id] — edit nama dan/atau status */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const body   = await req.json();
    const update: Record<string, unknown> = {};

    /* Update nama jika dikirim */
    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json({ message: "Nama kategori tidak boleh kosong." }, { status: 400 });
      }

      const current = await Category.findById(id).lean();
      if (!current) {
        return NextResponse.json({ message: "Kategori tidak ditemukan." }, { status: 404 });
      }

      /* Cek duplikat HANYA jika nama berubah */
      const nameChanged = body.name.trim().toLowerCase() !== current.name.toLowerCase();
      if (nameChanged) {
        const existing = await Category.findOne({
          _id:  { $ne: id },
          name: { $regex: new RegExp(`^${body.name.trim()}$`, "i") },
        });
        if (existing) {
          return NextResponse.json({ message: "Nama kategori sudah digunakan." }, { status: 409 });
        }
      }

      update.name = body.name.trim();
    }

    /* Update status jika dikirim */
    if (body.status !== undefined) {
      if (!["active", "inactive"].includes(body.status)) {
        return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
      }
      update.status = body.status;
    }

    const category = await Category.findByIdAndUpdate(id, update, { new: true });
    if (!category) {
      return NextResponse.json({ message: "Kategori tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (err) {
    console.error("PUT /api/categories/[id] error:", err);
    return NextResponse.json({ message: "Gagal memperbarui kategori." }, { status: 500 });
  }
}

/* DELETE /api/categories/[id] — hapus kategori saja, TIDAK menyentuh tabel produk */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json({ message: "Kategori tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ message: "Kategori berhasil dihapus." });
  } catch (err) {
    console.error("DELETE /api/categories/[id] error:", err);
    return NextResponse.json({ message: "Gagal menghapus kategori." }, { status: 500 });
  }
}