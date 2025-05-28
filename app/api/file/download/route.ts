import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

// to check if the client has any files available to download
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { message: "Not authorized" },
            { status: 403 }
        );
    }

    const { email } = await req.json();

    if (!email) {
        return NextResponse.json(
            { message: "Incomplete request" },
            { status: 400 }
        );
    }

    try {
        const fileList = await prisma.file.findMany({
            where: {
                recipientEmail: email,
            },
        });
        console.log(fileList);
        return NextResponse.json(fileList);
    } catch {
        return NextResponse.json(
            { message: "Error fetching files" },
            { status: 500 }
        );
    }
}
