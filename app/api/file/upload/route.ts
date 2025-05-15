import { getPutObjectUrl } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// this is so that /lib/s3.ts does not execute on the client, which can cause the .env variables to possibly leak causing security issues.

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json(
            { message: "not authorized" },
            { status: 401 }
        );
    }
    const urlWithKey = await getPutObjectUrl();

    return NextResponse.json(urlWithKey);
}
