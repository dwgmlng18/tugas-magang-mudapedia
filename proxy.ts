import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn   = !!req.auth;
  const role = req.auth?.user.role;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard"];
  const authRoutes      = ["/login", "/register"];

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (authRoutes.includes(pathname) && isLoggedIn) {
    const dest = role === "admin" ? "/dashboard/admin/kategori" : "/dashboard/kasir/produk";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  const adminOnlyRoutes = ["/dashboard/admin/kategori", "/dashboard/admin/produk", "/dashboard/admin/transaksi", "/dashboard/admin/user"];
  if (adminOnlyRoutes.some((r) => pathname.startsWith(r)) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/kasir/produk", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};