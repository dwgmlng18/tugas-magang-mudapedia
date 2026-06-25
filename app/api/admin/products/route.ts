import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab"); // "trash" | null

    const filter =
      tab === "trash"
        ? { status: "deleted" as const }
        : { status: { $in: ["active", "inactive"] as const } };

    const products = await Product.find(filter)
      .populate("category_id", "name")
      .sort({ updatedAt: -1 })
      .lean();

    const categories = await Category.find({ status: "active" })
      .select("_id name")
      .lean();

    return NextResponse.json({ products, categories });
  } catch {
    return NextResponse.json({ message: "Gagal mengambil data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

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

    // Cek duplikat nama — hanya di antara produk yang belum deleted
    const existing = await Product.findOne({
      name:   { $regex: new RegExp(`^${name.trim()}$`, "i") },
      status: { $ne: "deleted" },
    });
    if (existing) {
      return NextResponse.json({ message: "Nama produk sudah digunakan." }, { status: 409 });
    }

    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      const bytes  = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = await uploadToCloudinary(buffer);
    }

    const product = await Product.create({
      name:        name.trim(),
      category_id,
      price:       Number(price),
      description: description?.trim() || undefined,
      status:      status === "inactive" ? "inactive" : "active",
      image:       imageUrl ?? undefined,
    });

    await product.populate("category_id", "name");

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json({ message: "Gagal menyimpan produk." }, { status: 500 });
  }
}