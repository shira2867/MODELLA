// /app/api/user/route.ts (Next.js 13+ app router)
import { NextResponse } from "next/server";
import { usersCollection } from "@/services/server/users";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const col = await usersCollection();
    const user = await col.findOne({ email });

    if (user) {
      return NextResponse.json({
        exists: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          gender: user.gender,
        },
      });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
