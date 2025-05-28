import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    const { email, otp } = await req.json();
    const token = jwt.sign({ email }, process.env.NEXTAUTH_SECRET!!, {
        expiresIn: "10m",
    });
    const storedOtp = await redis.get(`passwordOtp:${email}`);
    if (!storedOtp) {
        return NextResponse.json(
            { success: false, message: "otp not found or expired" },
            { status: 403 }
        );
    }
    if (storedOtp !== otp) {
        return NextResponse.json(
            { success: false, message: "incorrect otp" },
            { status: 401 }
        );
    }

    return NextResponse.json({ success: true, token }, { status: 200 });
}
