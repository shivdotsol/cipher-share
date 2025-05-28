import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ mesage: "Not authorized" }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
        return NextResponse.json(
            { message: "Incomplete request" },
            { status: 400 }
        );
    }
    try {
        const res = await prisma.user.findUnique({ where: { email } });
        if (res?.privateKey) {
            return NextResponse.json({ privateKey: res.privateKey });
        }
    } catch {
        return NextResponse.json(
            {
                message: "Database issue",
            },
            { status: 500 }
        );
    }
    return NextResponse.json(
        {
            message: "Unknown error occurred",
        },
        { status: 500 }
    );
}
