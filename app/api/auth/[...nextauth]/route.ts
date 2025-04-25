import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function findExistingUser(email: string) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    return existingUser;
}

const handler = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                name: { label: "name", type: "text" },
                email: { label: "email", type: "email" },
                password: { label: "password", type: "password" },
                authType: { label: "authType", type: "text" },
            },
            async authorize(credentials, req) {
                // for when user registers using google for the first time, to store user into session, this part
                // will only be called after google OAuth succeeds, so no integrity issues hopefully
                if (credentials?.authType == "GOOGLE") {
                    const dbUser = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    });
                    if (dbUser) {
                        const user = { ...dbUser, image: dbUser.picture };
                        return user;
                    } else {
                        throw new Error("Google OAuth signup failed");
                    }
                } else {
                    try {
                        const user = await prisma.user.findUnique({
                            where: {
                                email: credentials?.email,
                            },
                        });
                        const isPasswordCorrect = await bcrypt.compare(
                            credentials?.password!!,
                            user?.password!!
                        );
                        if (!user) {
                            throw new Error("User does not exist.");
                        } else if (!isPasswordCorrect) {
                            throw new Error("Invalid credentials");
                        } else {
                            return user;
                        }
                    } catch (e) {
                        throw new Error("" + e);
                    }
                }
            },
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID || "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider == "google") {
                const existingUser = await findExistingUser(user.email || "");
                if (existingUser) {
                    return true;
                } else {
                    return "/login?error=user-not-found";
                }
            }
            return true;
        },
        async session({ session, token, user }) {
            // 🔥 Pull fresh data from DB here if needed
            const dbUser = await prisma.user.findUnique({
                where: { email: token.email as string },
            });

            if (dbUser && session.user) {
                session.user.name = dbUser.name;
                session.user.email = dbUser.email;
                session.user.image = dbUser.picture;
            }

            return session;
        },
    },

    pages: {
        signIn: "/login",
    },
});

export { handler as GET, handler as POST };
