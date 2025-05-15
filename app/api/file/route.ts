// to update the files table

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// to return a list of files related with an email
export async function POST(req: NextRequest) {
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json(
    //         { message: "Not authorized" },
    //         { status: 401 }
    //     );
    // }

    const { email } = await req.json();
    if (!email) {
        return NextResponse.json(
            { message: "missing inputs" },
            { status: 400 }
        );
    }

    try {
        const fileList = await prisma.file.findMany({
            where: {
                OR: [{ senderEmail: email }, { recipientEmail: email }],
            },
        });

        return NextResponse.json({ fileList });
    } catch {
        return NextResponse.json(
            { message: "Error reaching the db" },
            { status: 500 }
        );
    }
}

// to put the file data in the db
export async function PUT(req: NextRequest) {
    const session = getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { message: "Not authorized" },
            { status: 401 }
        );
    }

    const { key, name, size, currentStatus, recipientEmail, senderEmail } =
        await req.json();
    if (
        !key ||
        !name ||
        !size ||
        !currentStatus ||
        !recipientEmail ||
        !senderEmail
    ) {
        return NextResponse.json(
            { message: "missing inputs" },
            { status: 400 }
        );
    }

    try {
        const file = await prisma.file.create({
            data: {
                key,
                name,
                size,
                currentStatus,
                recipientEmail,
                senderEmail,
            },
        });

        if (file.id) {
            return NextResponse.json({ fileId: file.id });
        }
    } catch {
        return NextResponse.json({ message: "Failed" }, { status: 500 });
    }

    return NextResponse.json({ message: "Failed" }, { status: 500 });
}
