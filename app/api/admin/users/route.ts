import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import { auth } from "@/lib/auth";

// Helper: pastikan hanya admin yang bisa akses
async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}

// GET /api/admin/users — ambil semua user beserta profil
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Ambil semua user
  const users = await User.find({}).sort({ createdAt: -1 }).lean();

  // Ambil semua profil
  const profiles = await Profile.find({}).lean();

  // Gabungkan user + profil
  const result = users.map((u) => {
    const profile = profiles.find(
      (p) => p.user_id.toString() === u._id.toString()
    );
    return {
      _id:       u._id.toString(),
      email:     u.email,
      role:      u.role,
      status:    u.status,
      name:      profile?.name ?? "-",
      image:     profile?.image ?? null,
      createdAt: u.createdAt,
    };
  });

  return NextResponse.json(result);
}

// POST /api/admin/users — buat user baru (oleh admin)
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, password, role, status } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashed,
      role:     role   ?? "kasir",
      status:   status ?? "approve", // admin buat langsung approve
    });

    await Profile.create({
      user_id: user._id,
      name,
    });

    return NextResponse.json({ message: "User berhasil dibuat" }, { status: 201 });
  } catch (error) {
    console.error("CREATE USER ERROR", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// PUT /api/admin/users — update user (termasuk approve/reject)
export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, email, password, role, status } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID user wajib diisi" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah email baru sudah dipakai user lain
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: id } });
      if (emailTaken) {
        return NextResponse.json({ message: "Email sudah dipakai user lain" }, { status: 409 });
      }
      user.email = email;
    }

    if (role)   user.role   = role;
    if (status) user.status = status;

    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    // Update profil
    if (name) {
      await Profile.findOneAndUpdate(
        { user_id: id },
        { name },
        { upsert: true }
      );
    }

    return NextResponse.json({ message: "User berhasil diperbarui" });
  } catch (error) {
    console.error("UPDATE USER ERROR", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// DELETE /api/admin/users — hapus user
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID user wajib diisi" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    await User.findByIdAndDelete(id);
    await Profile.findOneAndDelete({ user_id: id });

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("DELETE USER ERROR", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}