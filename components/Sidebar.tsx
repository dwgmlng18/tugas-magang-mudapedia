"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutGrid,
  IconReceipt,
  IconTag,
  IconBox,
  IconChartBar,
  IconUsers,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ReactNode;
}

const kasirMenu: NavItem[] = [
  { label: "Katalog Produk", href: "/dashboard/kasir/produk",    icon: <IconLayoutGrid  size={18} stroke={1.5} /> },
  { label: "Transaksi",      href: "/dashboard/kasir/transaksi", icon: <IconReceipt     size={18} stroke={1.5} /> },
];

const adminMenu: NavItem[] = [
  { label: "Manajemen Kategori", href: "/dashboard/admin/kategori", icon: <IconTag      size={18} stroke={1.5} /> },
  { label: "Manajemen Produk",   href: "/dashboard/admin/produk",   icon: <IconBox      size={18} stroke={1.5} /> },
  { label: "Laporan Transaksi",  href: "/dashboard/admin/laporan",  icon: <IconChartBar size={18} stroke={1.5} /> },
  { label: "Manajemen Users",    href: "/dashboard/admin/users",    icon: <IconUsers    size={18} stroke={1.5} /> },
];

interface SidebarProps {
  role: "admin" | "kasir";
}

export default function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menu         = role === "admin" ? adminMenu : kasirMenu;
  const sectionLabel = role === "admin" ? "Admin"   : "Kasir";

  return (
    <aside
      className={`
        relative flex flex-col bg-white border-r border-green-100
        transition-[width] duration-200 ease-in-out flex-shrink-0
        ${collapsed ? "w-14" : "w-56"}
      `}
      style={{ minHeight: "100vh" }}
    >
      {/* ── Logo row ── */}
      <div className="h-14 flex items-center gap-2.5 px-3 border-b border-green-100 overflow-hidden flex-shrink-0">
        {/* Logo mark */}
        <div className="w-8 h-8 bg-green-600 rounded-[9px] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[14px] font-bold">C</span>
        </div>

        {/* App name — hidden when collapsed */}
        {!collapsed && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-[15px] font-bold text-green-900 whitespace-nowrap leading-none">
              Caelas
            </div>
            <div className="text-[10px] text-green-300 whitespace-nowrap leading-none mt-0.5">
              Sistem Kasir
            </div>
          </div>
        )}

        {/* Toggle collapse — visible only when expanded */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Tutup sidebar"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-green-100
                       hover:bg-green-50 hover:border-green-200 transition-colors flex-shrink-0 text-gray-400"
          >
            <IconLayoutSidebarLeftCollapse size={17} stroke={1.5} />
          </button>
        )}
      </div>

      {/* ── Re-open button — shown only when collapsed ── */}
      {collapsed && (
        <div className="flex justify-center py-2 border-b border-green-100">
          <button
            onClick={() => setCollapsed(false)}
            title="Buka sidebar"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-green-100
                       hover:bg-green-50 hover:border-green-200 transition-colors text-green-600"
          >
            <IconLayoutSidebarLeftExpand size={18} stroke={1.5} />
          </button>
        </div>
      )}

      {/* ── Menu ── */}
      <nav className="flex-1 py-3">
        {/* Section label */}
        {!collapsed && (
          <p className="text-[10px] font-bold text-green-200 uppercase tracking-[.1em] px-3.5 mb-2 whitespace-nowrap overflow-hidden">
            {sectionLabel}
          </p>
        )}

        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`
                group relative flex items-center gap-2.5 px-3.5 py-[9px] transition-colors
                ${isActive
                  ? "bg-green-100 text-green-700"
                  : "text-gray-500 hover:bg-green-50 hover:text-green-700"
                }
              `}
            >
              {/* Active bar */}
              {isActive && (
                <span className="absolute left-0 top-[5px] bottom-[5px] w-[3px] bg-green-600 rounded-r-[3px]" />
              )}

              {/* Icon */}
              <span
                className={`flex-shrink-0 ${
                  isActive ? "text-green-600" : "text-gray-400 group-hover:text-green-500"
                }`}
              >
                {item.icon}
              </span>

              {/* Label */}
              {!collapsed && (
                <span
                  className={`text-[13px] whitespace-nowrap ${
                    isActive ? "font-semibold text-green-700" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              )}

              {/* Floating tooltip when collapsed */}
              {collapsed && (
                <span
                  className="
                    pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2
                    bg-gray-800 text-white text-[12px] px-2.5 py-1 rounded-md whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity duration-100 z-50
                  "
                  role="tooltip"
                >
                  {item.label}
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-800" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}