import { authOptions } from "@/lib/authOptions";
import { putObjectUrl } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// this is so that /lib/s3.ts does not execute on the client, which can cause the .env variables to possibly leak causing security issues.

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { message: "not authorized" },
            { status: 401 }
        );
    }
    const urlWithKey = await putObjectUrl();

    return NextResponse.json(urlWithKey);
}
