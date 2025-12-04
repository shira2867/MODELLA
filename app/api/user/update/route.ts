// app/api/user/update/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; 
import { usersCollection } from "@/services/server/users";

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const {
      name,
      gender,
      profileImage,
    } = body;

    const col = await usersCollection();

    const result = await col.updateOne(
      {  _id: userId },
      {
        $set: {
          name,
          gender,
          profileImage,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, profileImage });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
