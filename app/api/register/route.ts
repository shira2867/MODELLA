// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usersCollection } from "@/services/server/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, gender, profileImage } = body;

    // basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
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

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // insert
    const now = new Date();
    await col.insertOne({
      name,
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
