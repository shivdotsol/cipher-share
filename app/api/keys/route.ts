import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// to check if the keys exist in the DB
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { message: "not authorized" },
            { status: 403 }
        );
    }

    const { email } = await req.json();
    if (!email) {
        return NextResponse.json({ message: "email missing" }, { status: 400 });
    }

    try {
        const res = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!res) {
            return NextResponse.json(
                { message: "User doesn't exist" },
                { status: 401 }
            );
        }
        if (res?.publicKey) {
            return NextResponse.json({
                success: true,
                publicKey: res.publicKey,
            });
        }
    } catch {
        return NextResponse.json(
            {
                message: "Error reaching the database",
                success: false,
            },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: false }, { status: 404 });
}

// to insert/update the keys in the DB
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json("Not authorised");
    }
    const { email, publicKey, privateKey } = await req.json();
    if (!email || !publicKey || !privateKey) {
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
                publicKey,
                privateKey,
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
