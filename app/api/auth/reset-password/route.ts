import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    if (!email || !password) {
        return NextResponse.json(
            { success: false, message: "Invalid Inputs" },
            { status: 400 }
        );
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
