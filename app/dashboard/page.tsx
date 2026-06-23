import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-emerald-100 shadow-sm shadow-emerald-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-slate-700 font-bold text-lg">Caelas</span>
          </div>

          {/* User Info + Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">
                {session.user.name}
              </p>
              <p className="text-xs text-slate-400">{session.user.email}</p>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-emerald-600 font-semibold text-sm">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Tombol Logout */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-xs text-slate-400 hover:text-red-400 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-xl transition"
              >
                Keluar
              </button>
            </form>
          </div>

        </div>
      </nav>

      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome Banner */}
        <div className="bg-emerald-500 rounded-3xl p-6 mb-8 shadow-lg shadow-emerald-200 flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Selamat datang,</p>
            <h1 className="text-white text-2xl font-bold">
              {session.user.name} 👋
            </h1>
            <p className="text-emerald-100 text-xs mt-2">
              Role: <span className="capitalize font-medium">{session.user.role}</span>
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-white text-3xl">🏪</span>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-50 shadow-sm shadow-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 font-medium">Total Transaksi</p>
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <span className="text-base">💳</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-700">0</p>
            <p className="text-xs text-slate-300 mt-1">Hari ini</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-50 shadow-sm shadow-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 font-medium">Total Pendapatan</p>
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <span className="text-base">💰</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-700">Rp 0</p>
            <p className="text-xs text-slate-300 mt-1">Hari ini</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-50 shadow-sm shadow-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 font-medium">Total Produk</p>
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <span className="text-base">📦</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-700">0</p>
            <p className="text-xs text-slate-300 mt-1">Produk aktif</p>
          </div>

        </div>

        {/* Info Akun */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-50 shadow-sm shadow-emerald-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Informasi Akun
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-xs text-slate-400">Nama</span>
              <span className="text-xs font-medium text-slate-600">
                {session.user.name}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-xs text-slate-400">Email</span>
              <span className="text-xs font-medium text-slate-600">
                {session.user.email}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-400">Role</span>
              <span className="text-xs font-medium text-emerald-500 capitalize bg-emerald-50 px-3 py-1 rounded-full">
                {session.user.role}
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}