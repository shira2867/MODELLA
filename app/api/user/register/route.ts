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

    // check if exists
    const exists = await col.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // hash password only if it exists
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    // insert user
    const now = new Date();
    await col.insertOne({
      name: name || null,
      email,
      passwordHash,
      gender: gender || null,
      profileImage: profileImage || null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
