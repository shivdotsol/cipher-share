import OtpEmail from "@/components/SignupEmail";
import redis from "@/lib/redis";
import resend from "@/lib/resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { email, firstName } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000);
    await redis.set(`otp:${email}`, otp, `EX`, 300);
    try {
        const resendResponse = await resend.emails.send({
            from: "CipherShare <noreply@ciphershare.in>",
            to: email,
            subject: "Email Verification OTP",
            react: OtpEmail({ firstName, otp }),
        });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
        return NextResponse.json(e, { status: 500 });
    }
}
