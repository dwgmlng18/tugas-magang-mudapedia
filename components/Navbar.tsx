"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

interface NavbarProps {
  name:  string;
  email: string;
  role:  "admin" | "kasir";
}

export default function Navbar({ name, email, role }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="h-14 bg-white border-b border-green-100 flex items-center justify-end px-5 flex-shrink-0">
      <div className="relative" ref={dropdownRef}>
        {/* Tombol profil */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-green-100 hover:bg-green-50 hover:border-green-200 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[12px] font-medium">{initials}</span>
          </div>
          <div className="text-left">
            <p className="text-[13px] font-medium text-gray-700 leading-none">{name}</p>
            <p className="text-[11px] text-green-600 leading-none mt-0.5 capitalize">{role}</p>
          </div>
          <i className="ti ti-chevron-down text-[14px] text-gray-400" aria-hidden="true" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-green-100 rounded-xl shadow-sm z-50 p-3">
            {/* Info user */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[14px] font-medium">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-gray-800 truncate">{name}</p>
                <p className="text-[11px] text-gray-400 truncate">{email}</p>
              </div>
            </div>

            <hr className="border-green-100 mb-2" />

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-red-50 transition-colors group"
            >
              <i className="ti ti-logout text-[16px] text-red-500" aria-hidden="true" />
              <span className="text-[13px] font-medium text-red-500">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}