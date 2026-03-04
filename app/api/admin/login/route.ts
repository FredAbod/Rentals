import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getMongooseConnection } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email, password } = loginSchema.parse(json);

    await getMongooseConnection();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 403 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_session", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("[admin.login] error", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
