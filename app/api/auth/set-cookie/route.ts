import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "ID Token required" }, { status: 400 });
    }

    const cookieName = "authToken";

    const response = NextResponse.json({ success: true });

    response.cookies.set(cookieName, idToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, 
      path: "/", 
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error setting cookie:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
