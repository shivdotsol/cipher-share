import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getObjectUrl } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { message: "not authorized" },
            { status: 401 }
        );
    }

    const { key } = await req.json();

    if (!key) {
        return NextResponse.json(
            { message: "Incomplete request" },
            { status: 400 }
        );
    }
    const downloadUrl = await getObjectUrl(key);

    return NextResponse.json(downloadUrl);
}
