"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  IconCamera,
  IconUser,
  IconMail,
  IconShieldCheck,
  IconCircleCheck,
  IconLock,
  IconDeviceFloppy,
  IconLoader2,
  IconAlertCircle,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

interface ProfileData {
  name:   string;
  image:  string | null;
  email:  string;
  role:   "admin" | "kasir";
  status: "pending" | "approve" | "reject";
}

// Badge status — selaras dengan STATUS_STYLE pada halaman Manajemen User
const statusLabel: Record<ProfileData["status"], { text: string; className: string }> = {
  approve: { text: "Aktif",   className: "bg-green-50  text-green-700  border border-green-200" },
  pending: { text: "Pending", className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  reject:  { text: "Ditolak", className: "bg-red-50    text-red-600    border border-red-200" },
};

// Badge role — selaras dengan ROLE_STYLE pada halaman Manajemen User
const roleStyle: Record<ProfileData["role"], string> = {
  admin: "bg-purple-50 text-purple-700 border border-purple-200",
  kasir: "bg-blue-50   text-blue-700   border border-blue-200",
};

export default function ProfilForm() {
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat profil.");
        if (!active) return;
        setProfile(data.profile);
        setName(data.profile.name);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat profil.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const initials = (name || profile?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB.");
      return;
    }

    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Nama tidak boleh kosong.");
      return;
    }
    if (password && password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password && password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (password) {
        formData.append("password", password);
        formData.append("confirmPassword", confirmPassword);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/profile", { method: "PUT", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui profil.");

      setProfile(data.profile);
      setName(data.profile.name);
      setPassword("");
      setConfirmPassword("");
      setImageFile(null);
      setImagePreview(null);
      setSuccess("Profil berhasil diperbarui.");
      await update({
        name: data.profile.name,
        image: data.profile.image,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  }

  // Token styling — disamakan dengan halaman Manajemen User (ukuran teks, border, radius)
  const inputCls    = "w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-green-400 focus:bg-white transition-colors";
  const readonlyCls = "w-full bg-gray-50 border-[1.5px] border-gray-100 rounded-xl px-3 py-2 text-[13px] text-gray-500 truncate";
  const labelCls    = "flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <IconLoader2 size={26} className="animate-spin text-green-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <span className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <IconAlertCircle size={15} stroke={2} className="text-red-500" />
        </span>
        <p className="text-[12px] font-semibold text-red-600">{error ?? "Profil tidak ditemukan."}</p>
      </div>
    );
  }

  const badge = statusLabel[profile.status];
  const displayImage = imagePreview ?? profile.image;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[18px] font-bold text-gray-900 leading-none">Profil Saya</h1>
        <p className="text-[12px] text-gray-400 mt-1">Kelola informasi akun dan keamanan Anda</p>
      </div>

      {/* Alert — error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <span className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconAlertCircle size={15} stroke={2} className="text-red-500" />
          </span>
          <p className="text-[12px] font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* Alert — success */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
          <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconCircleCheckFilled size={15} className="text-green-600" />
          </span>
          <p className="text-[12px] font-semibold text-green-700">{success}</p>
        </div>
      )}

      {/* Card: foto & informasi profil */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 mb-4">
        <p className="text-[13px] font-bold text-gray-900 mb-4">Informasi Profil</p>

        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 mb-5">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-600 flex items-center justify-center overflow-hidden ring-4 ring-green-50">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayImage} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-[18px] sm:text-[20px] font-bold">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Ganti foto"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-[1.5px] border-gray-200
                         flex items-center justify-center shadow-sm hover:bg-green-50 hover:border-green-300 transition-colors text-gray-400 hover:text-green-600"
            >
              <IconCamera size={14} stroke={1.75} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="min-w-0">
            <p className="text-[14px] font-bold text-gray-900 truncate">{name || "-"}</p>
            <p className="text-[12px] text-gray-400 truncate">{profile.email}</p>
            <p className="text-[11px] text-gray-400 mt-1">JPG, PNG &middot; maksimal 5MB</p>
          </div>
        </div>

        {/* Nama — editable */}
        <div className="mb-4">
          <label className={labelCls}>
            <IconUser size={14} stroke={1.75} className="text-green-500" />
            Nama
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama"
            className={inputCls}
          />
        </div>

        {/* Email, role, status — readonly */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>
              <IconMail size={14} stroke={1.75} className="text-gray-400" />
              Email
            </label>
            <div className={readonlyCls}>{profile.email}</div>
          </div>

          <div>
            <label className={labelCls}>
              <IconShieldCheck size={14} stroke={1.75} className="text-gray-400" />
              Role
            </label>
            <div className="w-full bg-gray-50 border-[1.5px] border-gray-100 rounded-xl px-3 py-2 flex items-center">
              <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap ${roleStyle[profile.role]}`}>
                {profile.role}
              </span>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              <IconCircleCheck size={14} stroke={1.75} className="text-gray-400" />
              Status
            </label>
            <div className="w-full bg-gray-50 border-[1.5px] border-gray-100 rounded-xl px-3 py-2 flex items-center">
              <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${badge.className}`}>
                {badge.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card: ganti password */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 mb-5">
        <p className="text-[13px] font-bold text-gray-900 mb-1">Ubah Password</p>
        <p className="text-[11px] text-gray-400 mb-4">Kosongkan jika tidak ingin mengubah password</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              <IconLock size={14} stroke={1.75} className="text-green-500" />
              Password Baru
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              <IconLock size={14} stroke={1.75} className="text-green-500" />
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white
                     text-[13px] font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <IconLoader2 size={15} className="animate-spin" />
          ) : (
            <IconDeviceFloppy size={15} stroke={2} />
          )}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}