import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usersCollection } from "@/services/server/users";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const col = await usersCollection();

    const existingUser = await col.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    const result = await col.insertOne({
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    // ✅ חובה await
    const cookieStore = await cookies();
    cookieStore.set("userId", result.insertedId.toString(), {
      httpOnly: true,
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", ok: false },
      { status: 500 }
    );
  }
}
