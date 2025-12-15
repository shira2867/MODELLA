import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usersCollection } from "@/services/server/users";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, name, profileImage } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const col = await usersCollection();
    const now = new Date();

    let user = await col.findOne({ email });

    if (!user) {
      const passwordHash = password ? await bcrypt.hash(password, 10) : null;

      const result = await col.insertOne({
        email,
        name: name || null,
        profileImage: profileImage || null,
        passwordHash,
        createdAt: now,
        updatedAt: now,
      });

      user = { _id: result.insertedId, email };
    }

    const cookieStore = await cookies();
    cookieStore.set("userId", user._id.toString(), {
      httpOnly: true,
      path: "/",
    });

    return NextResponse.json({ ok: true, userExists: !!user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error", ok: false }, { status: 500 });
  }
}
