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

const statusLabel: Record<ProfileData["status"], { text: string; className: string }> = {
  approve: { text: "Aktif",    className: "bg-green-100 text-green-700" },
  pending: { text: "Pending",  className: "bg-yellow-100 text-yellow-700" },
  reject:  { text: "Ditolak",  className: "bg-red-100 text-red-600" },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <IconLoader2 size={28} className="animate-spin text-green-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border-[1.5px] border-red-100 rounded-xl px-4 py-3">
        <IconAlertCircle size={18} stroke={1.5} />
        {error ?? "Profil tidak ditemukan."}
      </div>
    );
  }

  const badge = statusLabel[profile.status];
  const displayImage = imagePreview ?? profile.image;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {/* Alert */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-[13px] bg-red-50 border-[1.5px] border-red-100 rounded-xl px-4 py-3 mb-4">
          <IconAlertCircle size={16} stroke={1.5} className="flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-700 text-[13px] bg-green-50 border-[1.5px] border-green-100 rounded-xl px-4 py-3 mb-4">
          <IconCircleCheckFilled size={16} className="flex-shrink-0 text-green-600" />
          {success}
        </div>
      )}

      {/* Card: foto & nama */}
      <div className="bg-white border-[1.5px] border-green-100 rounded-xl p-5 mb-4">
        <p className="text-[13px] font-bold text-green-900 mb-4">Informasi Profil</p>

        <div className="flex items-center gap-5 mb-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center overflow-hidden border-[1.5px] border-green-100">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayImage} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-[20px] font-bold">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Ganti foto"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-[1.5px] border-green-100
                         flex items-center justify-center hover:bg-green-50 hover:border-green-200 transition-colors text-green-600"
            >
              <IconCamera size={14} stroke={1.5} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div>
            <p className="text-[14px] font-semibold text-gray-800">{name || "-"}</p>
            <p className="text-[12px] text-gray-400">{profile.email}</p>
            <p className="text-[11px] text-green-300 mt-1">JPG, PNG, maksimal 5MB</p>
          </div>
        </div>

        {/* Nama — editable */}
        <div className="mb-3">
          <label className="text-[12px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
            <IconUser size={14} stroke={1.5} className="text-green-500" />
            Nama
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama"
            className="w-full text-[13px] px-3.5 py-2.5 rounded-lg border-[1.5px] border-green-100
                       focus:outline-none focus:border-green-400 transition-colors"
          />
        </div>

        {/* Email, role, status — readonly */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[12px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <IconMail size={14} stroke={1.5} className="text-gray-400" />
              Email
            </label>
            <div className="w-full text-[13px] px-3.5 py-2.5 rounded-lg bg-gray-50 border-[1.5px] border-gray-100 text-gray-500 truncate">
              {profile.email}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <IconShieldCheck size={14} stroke={1.5} className="text-gray-400" />
              Role
            </label>
            <div className="w-full text-[13px] px-3.5 py-2.5 rounded-lg bg-gray-50 border-[1.5px] border-gray-100 text-gray-500 capitalize">
              {profile.role}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <IconCircleCheck size={14} stroke={1.5} className="text-gray-400" />
              Status
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border-[1.5px] border-gray-100">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                {badge.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card: ganti password */}
      <div className="bg-white border-[1.5px] border-green-100 rounded-xl p-5 mb-5">
        <p className="text-[13px] font-bold text-green-900 mb-1">Ubah Password</p>
        <p className="text-[11px] text-gray-400 mb-4">Kosongkan jika tidak ingin mengubah password</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <IconLock size={14} stroke={1.5} className="text-green-500" />
              Password Baru
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full text-[13px] px-3.5 py-2.5 rounded-lg border-[1.5px] border-green-100
                         focus:outline-none focus:border-green-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <IconLock size={14} stroke={1.5} className="text-green-500" />
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full text-[13px] px-3.5 py-2.5 rounded-lg border-[1.5px] border-green-100
                         focus:outline-none focus:border-green-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-[13px] font-semibold
                     hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : (
            <IconDeviceFloppy size={16} stroke={1.5} />
          )}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}