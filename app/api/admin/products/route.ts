import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { uploadToCloudinary } from "@/lib/cloudinary";

/* GET /api/admin/products — semua produk (aktif & nonaktif) untuk halaman admin */
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find()
      .populate("category_id", "name")
      .sort({ createdAt: -1 })
      .lean();

    const categories = await Category.find({ status: "active" })
      .select("_id name")
      .lean();

    return NextResponse.json({ products, categories });
  } catch {
    return NextResponse.json({ message: "Gagal mengambil data." }, { status: 500 });
  }
}

/* POST /api/admin/products — tambah produk baru (FormData karena ada upload gambar) */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Pakai FormData bukan JSON karena ada file gambar
    const formData   = await req.formData();
    const name       = formData.get("name")        as string | null;
    const category_id = formData.get("category_id") as string | null;
    const price      = formData.get("price")       as string | null;
    const description = formData.get("description") as string | null;
    const status     = formData.get("status")      as string | null;
    const imageFile  = formData.get("image")       as File   | null;

    // Validasi field wajib
    if (!name?.trim()) {
      return NextResponse.json({ message: "Nama produk tidak boleh kosong." }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ message: "Kategori harus dipilih." }, { status: 400 });
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ message: "Harga tidak valid." }, { status: 400 });
    }

    // Cek duplikat nama (case-insensitive)
    const existing = await Product.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existing) {
      return NextResponse.json({ message: "Nama produk sudah digunakan." }, { status: 409 });
    }

    // Upload gambar ke Cloudinary jika ada
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
      description: description?.trim() || null,
      status:      status === "inactive" ? "inactive" : "active",
      image:       imageUrl ?? null,
    });

    // Populate category_id supaya response langsung lengkap
    await product.populate("category_id", "name");

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json({ message: "Gagal menyimpan produk." }, { status: 500 });
  }
}