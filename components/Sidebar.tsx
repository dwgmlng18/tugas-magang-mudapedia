"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string; // nama class Tabler Icon
}

const kasirMenu: NavItem[] = [
  { label: "Katalog Produk", href: "/dashboard/kasir/produk",   icon: "ti-layout-grid" },
  { label: "Transaksi",      href: "/dashboard/kasir/transaksi", icon: "ti-receipt"     },
];

const adminMenu: NavItem[] = [
  { label: "Manajemen Kategori",  href: "/dashboard/admin/kategori",  icon: "ti-tag"       },
  { label: "Manajemen Produk",    href: "/dashboard/admin/produk",    icon: "ti-box"       },
  { label: "Laporan Transaksi",   href: "/dashboard/admin/laporan",   icon: "ti-chart-bar" },
  { label: "Manajemen Users",     href: "/dashboard/admin/users",     icon: "ti-users"     },
];

interface SidebarProps {
  role: "admin" | "kasir";
}

export default function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menu = role === "admin" ? adminMenu : kasirMenu;
  const sectionLabel = role === "admin" ? "Admin" : "Kasir";

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-green-100 transition-all duration-200 ease-in-out
        ${collapsed ? "w-14" : "w-56"}
      `}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-3.5 border-b border-green-100 overflow-hidden flex-shrink-0">
        <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[13px] font-medium">C</span>
        </div>
        {!collapsed && (
          <span className="text-[14px] font-medium text-green-800 whitespace-nowrap">
            Caelas
          </span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-3">
        {!collapsed && (
          <p className="text-[10px] font-medium text-green-300 uppercase tracking-widest px-3.5 mb-1.5">
            {sectionLabel}
          </p>
        )}
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                relative flex items-center gap-2.5 px-3.5 py-2.5 transition-colors
                ${isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-green-50 hover:text-green-700"
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-green-600 rounded-r-sm" />
              )}
              <i
                className={`ti ${item.icon} text-[18px] flex-shrink-0 ${
                  isActive ? "text-green-600" : "text-gray-400"
                }`}
                aria-hidden="true"
              />
              {!collapsed && (
                <span className={`text-[13px] whitespace-nowrap ${isActive ? "font-medium" : ""}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex items-center gap-2.5 px-3.5 py-3 border-t border-green-100 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
        title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
      >
        <i
          className={`ti ${collapsed ? "ti-layout-sidebar-left-expand" : "ti-layout-sidebar-left-collapse"} text-[18px]`}
          aria-hidden="true"
        />
        {!collapsed && (
          <span className="text-[13px] whitespace-nowrap">Tutup sidebar</span>
        )}
      </button>
    </aside>
  );
}