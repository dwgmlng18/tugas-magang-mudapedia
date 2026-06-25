"use client";

import { useState, useEffect, useCallback } from "react";

type UserStatus = "pending" | "approve" | "reject";
type UserRole   = "admin" | "kasir";

interface UserRow {
  _id:       string;
  name:      string;
  email:     string;
  role:      UserRole;
  status:    UserStatus;
  createdAt: string;
}

const STATUS_LABEL: Record<UserStatus, string> = {
  pending: "Menunggu",
  approve: "Disetujui",
  reject:  "Ditolak",
};

const STATUS_STYLE: Record<UserStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  approve: "bg-green-50  text-green-700  border border-green-200",
  reject:  "bg-red-50    text-red-600    border border-red-200",
};

const ROLE_STYLE: Record<UserRole, string> = {
  admin: "bg-purple-50 text-purple-700 border border-purple-200",
  kasir: "bg-blue-50   text-blue-700   border border-blue-200",
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "kasir" as UserRole, status: "approve" as UserStatus };

export default function AdminUsersPage() {
  const [users,        setUsers]        = useState<UserRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "all">("all");

  const [modal,    setModal]    = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      showToast("Gagal memuat data user", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = users.filter((u) => u.status === "pending").length;

  const quickUpdate = async (id: string, status: UserStatus) => {
    try {
      const res = await fetch("/api/admin/users", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      showToast(status === "approve" ? "User disetujui!" : "User ditolak.");
      fetchUsers();
    } catch {
      showToast("Gagal memperbarui status", "error");
    }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal("create"); };
  const openEdit   = (u: UserRow) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role, status: u.status });
    setSelected(u);
    setModal("edit");
  };
  const openDelete = (u: UserRow) => { setSelected(u); setModal("delete"); };

  const handleSubmit = async () => {
    if (!form.name || !form.email)               { showToast("Nama dan email wajib diisi", "error"); return; }
    if (modal === "create" && !form.password)     { showToast("Password wajib diisi", "error"); return; }
    setSaving(true);
    try {
      const isEdit  = modal === "edit";
      const payload = isEdit ? { id: selected!._id, ...form } : form;
      const res     = await fetch("/api/admin/users", {
        method:  isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message, "error"); return; }
      showToast(data.message);
      setModal(null);
      fetchUsers();
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/users", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: selected._id }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message, "error"); return; }
      showToast(data.message);
      setModal(null);
      fetchUsers();
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-green-400 focus:bg-white transition-colors";
  const labelCls = "block text-[12px] font-semibold text-gray-600 mb-1.5";

  return (
    <div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-[13px] font-semibold shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header — sama persis dengan halaman produk ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900 leading-none">Manajemen User</h1>
          <p className="text-[12px] text-gray-400 mt-1">
            {loading ? "Memuat..." : `${filtered.length} user ditampilkan`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white
                     text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah User
        </button>
      </div>

      {/* Pending banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5">
          <span className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </span>
          <p className="text-[12px] font-semibold text-yellow-700">
            Ada <span className="font-extrabold">{pendingCount}</span> permintaan pendaftaran menunggu persetujuan.
          </p>
          <button
            onClick={() => setFilterStatus("pending")}
            className="ml-auto text-[11px] font-bold text-yellow-700 underline hover:text-yellow-900 transition flex-shrink-0"
          >
            Lihat
          </button>
        </div>
      )}

      {/* Toolbar — search + filter status */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-[1.5px] border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[13px]
                       text-gray-800 placeholder-gray-300 focus:outline-none focus:border-green-400 transition-colors bg-white"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "pending", "approve", "reject"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold border-[1.5px] transition-all ${
                filterStatus === s
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"
              }`}
            >
              {s === "all" ? "Semua" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabel — dibungkus overflow-x-auto agar bisa scroll di layar kecil ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-9 h-9 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
              </svg>
              <p className="text-[13px] font-semibold">Tidak ada user ditemukan</p>
            </div>
          ) : (
            /* min-w menjamin tabel tidak kolaps di layar sempit */
            <table className="w-full text-[13px] min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Nama</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u._id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 !== 0 ? "bg-gray-50/20" : ""}`}
                  >
                    {/* Nama */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 font-bold text-[11px]">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-semibold text-gray-800 whitespace-nowrap">{u.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{u.email}</td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap ${ROLE_STYLE[u.role]}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${STATUS_STYLE[u.status]}`}>
                        {STATUS_LABEL[u.status]}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end flex-nowrap">
                        {u.status === "pending" && (
                          <>
                            <button
                              onClick={() => quickUpdate(u._id, "approve")}
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white
                                         text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                              Setujui
                            </button>
                            <button
                              onClick={() => quickUpdate(u._id, "reject")}
                              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white
                                         text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                              Tolak
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-2.5">
        Menampilkan {filtered.length} dari {users.length} user
      </p>

      {/* ── Modal Create / Edit ── */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-gray-900">
                {modal === "create" ? "Tambah User Baru" : "Edit User"}
              </h2>
              <button onClick={() => setModal(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Nama Lengkap <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama lengkap" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@contoh.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>
                  Password {modal === "edit" && <span className="text-gray-400 font-normal">(kosongkan jika tidak diganti)</span>}
                  {modal === "create" && <span className="text-red-400"> *</span>}
                </label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={modal === "edit" ? "Biarkan kosong untuk tidak mengubah" : "Minimal 8 karakter"}
                  className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className={inputCls}>
                    <option value="kasir">Kasir</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })} className={inputCls}>
                    <option value="pending">Menunggu</option>
                    <option value="approve">Disetujui</option>
                    <option value="reject">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2 rounded-lg border-[1.5px] border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50">
                {saving ? "Menyimpan..." : modal === "create" ? "Tambah User" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Delete ── */}
      {modal === "delete" && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h2 className="text-[16px] font-bold text-gray-900 mb-1">Hapus User?</h2>
            <p className="text-[13px] text-gray-500 mb-5">
              User <span className="font-bold text-gray-700">{selected.name}</span> ({selected.email}) akan dihapus permanen.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2 rounded-lg border-[1.5px] border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold transition-colors disabled:opacity-50">
                {saving ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}