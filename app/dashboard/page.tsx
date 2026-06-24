import { auth }     from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user?.role === "admin") {
    redirect("/dashboard/admin/kategori");
  } else {
    redirect("/dashboard/kasir/produk");
  }
}