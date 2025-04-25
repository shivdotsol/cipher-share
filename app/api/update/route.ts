import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { name, email } = await req.json();
    if (!name || !email) {
        return NextResponse.json(
            { success: false, message: "Inputs are empty" },
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.update({
            where: {
                email,
            },
            data: {
                name,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Update seccessfull",
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Unknown error" },
            { status: 500 }
        );
    }
}
