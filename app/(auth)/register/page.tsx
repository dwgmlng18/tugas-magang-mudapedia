"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message);
    } else {
      setSuccess("Registrasi berhasil! Mengarahkan ke login...");
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">

      <div className="w-full max-w-sm px-4">

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-700">Caelas</h1>
          <p className="text-slate-400 text-sm mt-1">Sistem Kasir Modern</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-100 p-8 border border-emerald-50">

          <h2 className="text-lg font-semibold text-slate-700 mb-1">Daftar Akun</h2>
          <p className="text-slate-400 text-xs mb-6">
            Isi data di bawah untuk membuat akun baru.
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-400 px-4 py-3 rounded-2xl mb-5 text-xs text-center">
              {error}
            </div>
          )}

          {/* Sukses */}
          {success && (
            <div className="bg-emerald-50 text-emerald-500 px-4 py-3 rounded-2xl mb-5 text-xs text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nama */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 focus:bg-white transition"
                placeholder="Nama lengkap kamu"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 focus:bg-white transition"
                placeholder="contoh@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 focus:bg-white transition"
                placeholder="Minimal 8 karakter"
                minLength={8}
                required
              />
            </div>

            {/* Tombol */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-emerald-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Daftar Sekarang"
              )}
            </button>

          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-emerald-500 font-semibold hover:text-emerald-600 transition">
              Masuk di sini
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-slate-300 text-xs mt-6">
          © 2026 Caelas. All rights reserved.
        </p>

      </div>
    </div>
  );
}