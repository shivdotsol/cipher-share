import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { email, otp } = await req.json();
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

    return NextResponse.json({ success: true }, { status: 200 });
}
