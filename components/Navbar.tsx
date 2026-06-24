"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";

interface NavbarProps {
  name:  string;
  email: string;
  role:  "admin" | "kasir";
}

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/dashboard/kasir/produk":    { title: "Katalog Produk",     sub: "Daftar semua produk"    },
  "/dashboard/kasir/transaksi": { title: "Transaksi",          sub: "Riwayat transaksi"      },
  "/dashboard/admin/kategori":  { title: "Manajemen Kategori", sub: "Kelola kategori produk" },
  "/dashboard/admin/produk":    { title: "Manajemen Produk",   sub: "Tambah dan edit produk" },
  "/dashboard/admin/laporan":   { title: "Laporan Transaksi",  sub: "Rekap penjualan"        },
  "/dashboard/admin/users":     { title: "Manajemen Users",    sub: "Kelola akun pengguna"   },
};

export default function Navbar({ name, email, role }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const page = pageTitles[pathname] ?? { title: "Dashboard", sub: "Selamat datang" };

  const initials = (name ?? email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white border-b-[1.5px] border-green-100 flex items-center justify-between px-5 flex-shrink-0">
      {/* Judul halaman */}
      <div>
        <p className="text-[15px] font-bold text-green-900 leading-none">{page.title}</p>
        <p className="text-[11px] text-green-300 leading-none mt-0.5">{page.sub}</p>
      </div>

      {/* Kanan: profil */}
      <div className="flex items-center gap-2">
        {/* Profil dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border-[1.5px] border-green-100
                       hover:bg-green-50 hover:border-green-200 transition-colors"
          >
            <div className="w-[30px] h-[30px] rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
            <div className="text-left">
              <p className="text-[12px] font-semibold text-gray-800 leading-none">{name || email}</p>
              <p className="text-[10px] font-medium text-green-600 leading-none mt-0.5 capitalize">{role}</p>
            </div>
            <span className={`text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
              <IconChevronDown size={13} stroke={1.5} />
            </span>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border-[1.5px] border-green-100 rounded-xl z-50 p-3 shadow-sm">
              {/* User info */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[13px] font-bold">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{name || "-"}</p>
                  <p className="text-[11px] text-gray-400 truncate">{email}</p>
                </div>
              </div>

              <hr className="border-green-100 mb-2" />

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/menu" })}
                className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <IconLogout size={16} stroke={1.5} className="text-red-500" />
                <span className="text-[13px] font-semibold text-red-500">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}