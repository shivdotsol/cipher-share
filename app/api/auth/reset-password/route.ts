import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { email, password, passwordResetToken } = await req.json();
    if (!email || !password || !passwordResetToken) {
        return NextResponse.json(
            { success: false, message: "Incomplete Inputs" },
            { status: 400 }
        );
    }

    try {
        const decoded = jwt.verify(
            passwordResetToken,
            process.env.NEXTAUTH_SECRET!!
        ) as { email: string };
        if (decoded.email !== email) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }
    } catch {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.update({
            where: {
                email,
            },
            data: {
                password: hashedPassword,
            },
        });
        if (user.password === hashedPassword) {
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json(
                { success: false, message: "unknown error occurred" },
                { status: 500 }
            );
        }
    } catch (e) {
        return NextResponse.json(e, { status: 500 });
    }
}
