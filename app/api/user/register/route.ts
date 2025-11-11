import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usersCollection } from "@/services/server/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, gender, profileImage } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const col = await usersCollection();
    const now = new Date();

    const existingUser = await col.findOne({ email });

    if (existingUser) {
      // עדכון משתמש קיים
      await col.updateOne(
        { email },
        {
          $set: {
            name: name || existingUser.name,
            gender: gender || existingUser.gender,
            profileImage: profileImage || existingUser.profileImage,
            updatedAt: now,
          },
        }
      );

      return NextResponse.json({ ok: true, exists: true, message: "User updated" });
    }

    // יצירת משתמש חדש
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    await col.insertOne({
      name: name || null,
      email,
      passwordHash,
      gender: gender || null,
      profileImage: profileImage || null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true, exists: false, message: "User created" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", ok: false },
      { status: 500 }
    );
  }
}
