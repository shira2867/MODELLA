import { NextResponse } from "next/server";
import { usersCollection } from "@/services/server/users";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, name, gender, profileImage } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const col = await usersCollection();

    const result = await col.updateOne(
      { email },
      { $set: { name, gender,profileImage, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
