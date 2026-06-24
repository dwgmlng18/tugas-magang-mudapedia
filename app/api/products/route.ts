import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");

    const productFilter: Record<string, unknown> = { status: "active" };
    if (categoryId) productFilter.category_id = categoryId;

    const products = await Product.find(productFilter)
      .populate("category_id", "name")
      .lean();

    const categories = await Category.find({ status: "active" })
      .select("_id name")
      .lean();

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}