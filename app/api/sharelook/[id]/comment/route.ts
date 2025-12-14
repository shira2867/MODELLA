import { NextRequest, NextResponse } from "next/server";
import { shareLooksCollection } from "@/services/server/shareLook";
import { usersCollection } from "@/services/server/users";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Missing text" },
        { status: 400 }
      );
    }

    const newComment = {
      userId,
      text: text.trim(),
      createdAt: new Date(),
    };

    const collection = await shareLooksCollection();

    const result = await collection.updateOne(
      { _id: id },
      { $push: { comments: newComment } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Look not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        comment: newComment,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error adding comment:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const collection = await shareLooksCollection();

    let look = await collection.findOne({ _id: id });

    if (!look) {
      look = await collection.findOne({ lookId: id });
    }

    if (!look) {
      return NextResponse.json(
        { comments: [] },
        { status: 200 }
      );
    }

    const rawComments = look.comments || [];

    const userIds = Array.from(
      new Set(
        rawComments
          .map((c: any) => c.userId)
          .filter((userId: string | undefined) => !!userId)
      )
    );

    let usersById: Record<string, any> = {};

    if (userIds.length > 0) {
      const usersCol = await usersCollection();

      const objectIds = userIds
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      const users = await usersCol
        .find({ _id: { $in: objectIds } })
        .project({ _id: 1, name: 1, profileImage: 1 })
        .toArray();

      usersById = users.reduce((acc: Record<string, any>, user: any) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});
    }

    const comments = rawComments.map((c: any) => {
      const user = c.userId ? usersById[c.userId] : null;

      const userName =
        (typeof user?.name === "string" && user.name.trim()) ||
        (typeof c.userName === "string" && c.userName.trim()) ||
        "User";

      const profileImage =
        user?.profileImage ??
        c.profileImage ??
        null;

      return {
        ...c,
        userName,
        profileImage,
      };
    });

    return NextResponse.json(
      { comments },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching comments:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
