import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type AuthType = "EMAIL" | "GOOGLE";

interface RequestBody {
    name: string;
    email: string;
    password?: string;
    publicKey: string;
    picture?: string;
    authType: AuthType;
}

export async function POST(req: NextRequest) {
    const body: RequestBody = await req.json();
    console.log(
        "// // // // // // // // // // // // // // // // // // // // // // // // // // // // // //"
    );
    console.log(body);

    if (body.authType === "EMAIL") {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: body.email,
                },
            });
            if (user) {
                return NextResponse.json(
                    {
                        message: "email already in use.",
                    },
                    { status: 409 }
                );
            } else {
                const hashedPassword = await bcrypt.hash(body.password!!, 10);

                const newUser = await prisma.user.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        password: hashedPassword,
                        publicKey: body.publicKey,
                        authType: body.authType,
                    },
                });

                return NextResponse.json({
                    message: "User registered successfully.",
                });
            }
        } catch {
            return NextResponse.json(
                {
                    message: "unexpected error",
                },
                { status: 500 }
            );
        }
    } else {
        try {
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: body.email,
                },
            });
            if (existingUser) {
                return NextResponse.json(
                    {
                        message: "Email already in use.",
                    },
                    { status: 409 }
                );
            } else {
                const user = await prisma.user.create({
                    data: body,
                });
                if (user) {
                    return NextResponse.json({
                        message: "user created successfully",
                        id: user.id,
                    });
                } else {
                    return NextResponse.json(
                        {
                            message: "error creating user",
                        },
                        { status: 500 }
                    );
                }
            }
        } catch {
            return NextResponse.json(
                {
                    message: "unexpected error",
                },
                { status: 500 }
            );
        }
    }
}
