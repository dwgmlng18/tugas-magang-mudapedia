"use client";

import { useState } from "react";
import { getSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.includes("@")) { setError("Format email tidak valid."); return; }
    if (!form.password)             { setError("Password tidak boleh kosong."); return; }

    setLoading(true);
    const res = await signIn("credentials", {
      email:    form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("Email atau password salah.");
    } else {
      const session = await getSession();
      if (session?.user.role === "admin") {
        router.push("/dashboard/admin/kategori");
      } else {
        router.push("/dashboard/kasir/produk");
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="bg-white border border-[#d1fae5] rounded-2xl p-9">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-7 pb-7 border-b border-[#f0fdf4]">
            <div className="w-11 h-11 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-extrabold">C</span>
            </div>
            <div>
              <p className="text-[17px] font-bold text-gray-900">Caelas</p>
              <p className="text-xs text-gray-400">Sistem Kasir Modern</p>
            </div>
          </div>

          <h1 className="text-[22px] font-extrabold text-gray-900 mb-1">Masuk</h1>
          <p className="text-[13px] text-gray-500 mb-6">Selamat datang kembali, masukkan akunmu.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-[13px] font-medium text-center mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
                </svg>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contoh@email.com"
                  className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl pl-10 pr-4 py-3 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Masukkan password"
                  className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl pl-10 pr-11 py-3 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label="Tampilkan password"
                >
                  {showPass ? (
                    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-3 rounded-xl text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Memproses...
                </span>
              ) : "Masuk"}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-500 mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-green-600 font-bold hover:text-green-700 transition">
              Daftar di sini
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-300 text-xs mt-5">© 2026 Caelas. All rights reserved.</p>
      </div>
    </div>
  );
}