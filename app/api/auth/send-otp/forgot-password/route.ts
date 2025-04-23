import ForgotPasswordEmail from "@/components/ForgotPasswordEmail";
import redis from "@/lib/redis";
import resend from "@/lib/resend";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000);
    await redis.set(`passwordOtp:${email}`, otp, `EX`, 300);

    // check if account exists

    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "account doesn't exist" },
                { status: 404 }
            );
        }
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            { success: false, message: "error reaching the database" },
            { status: 500 }
        );
    }

    try {
        const resendResponse = await resend.emails.send({
            from: "CipherShare <noreply@ciphershare.in>",
            to: email,
            subject: "Password Reset OTP",
            react: ForgotPasswordEmail({ otp }),
        });
        // console.log(resendResponse);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
        return NextResponse.json(e, { status: 500 });
    }
}
