import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

/* GET /api/profile — ambil data profil user yang sedang login */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("email role status").lean();
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });
    }

    let profile = await Profile.findOne({ user_id: session.user.id }).lean();

    // Jika profil belum ada (user lama / belum pernah isi), buat default kosong
    if (!profile) {
      const created = await Profile.create({
        user_id: session.user.id,
        name: user.email.split("@")[0],
      });
      profile = created.toObject ? created.toObject() : (created as any);
    }

    return NextResponse.json({
      profile: {
        name:   profile!.name,
        image:  profile!.image,
        email:  user.email,
        role:   user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ message: "Gagal mengambil data profil." }, { status: 500 });
  }
}

/* PUT /api/profile — update nama, gambar, dan/atau password */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }

    await connectDB();

    const formData        = await req.formData();
    const name             = formData.get("name")            as string | null;
    const password         = formData.get("password")        as string | null;
    const confirmPassword  = formData.get("confirmPassword")  as string | null;
    const imageFile        = formData.get("image")            as File   | null;

    // Validasi nama
    if (!name?.trim()) {
      return NextResponse.json({ message: "Nama tidak boleh kosong." }, { status: 400 });
    }

    // Validasi password (opsional — hanya divalidasi & diupdate jika diisi)
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: "Password minimal 6 karakter." },
          { status: 400 }
        );
      }
      if (password !== confirmPassword) {
        return NextResponse.json(
          { message: "Konfirmasi password tidak cocok." },
          { status: 400 }
        );
      }
    }

    const profile = await Profile.findOne({ user_id: session.user.id });
    if (!profile) {
      return NextResponse.json({ message: "Profil tidak ditemukan." }, { status: 404 });
    }

    // Upload gambar baru jika ada → hapus gambar lama dari Cloudinary
    if (imageFile && imageFile.size > 0) {
      if (profile.image) {
        await deleteFromCloudinary(profile.image);
      }
      const bytes  = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      profile.image = await uploadToCloudinary(buffer, "kasir/profiles");
    }

    profile.name = name.trim();
    await profile.save();

    // Update password di User jika diisi
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(session.user.id, { password: hashed });
    }

    const user = await User.findById(session.user.id).select("email role status").lean();

    return NextResponse.json({
      message: "Profil berhasil diperbarui.",
      profile: {
        name:   profile.name,
        image:  profile.image,
        email:  user!.email,
        role:   user!.role,
        status: user!.status,
      },
    });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    return NextResponse.json({ message: "Gagal memperbarui profil." }, { status: 500 });
  }
}