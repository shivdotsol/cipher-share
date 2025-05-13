"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PrismaClient } from "@prisma/client";

import {
    Download,
    FileText,
    LogOut,
    Save,
    Shield,
    Upload,
    User,
} from "lucide-react";
import {
    getSession,
    SessionProvider,
    signOut,
    useSession,
} from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { toast } from "sonner";
import axios from "axios";

const prisma = new PrismaClient();

function Profile() {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const loaderColor = resolvedTheme === "light" ? "#ffffff" : "#000000";
    const { data: session, status } = useSession();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmiting] = useState(false);
    const [error, setError] = useState("");

    const isEditing = session?.user?.name !== name;

    useEffect(() => {
        if (error.length > 0) {
            const errorContent = error;
            toast(errorContent);
            setError("");
        }
    }, [error]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status]);

    useEffect(() => {
        if (session?.user) {
            setName(session?.user?.name || "");
            setEmail(session?.user?.email || "");
        }
    }, [session]);

    if (status === "unauthenticated") return null;
    if (status === "loading") return <h1>Loading...</h1>;

    const recentActivity = [
        {
            id: "file-uuid-1",
            name: "resume.pdf",
            url: "https://s3.aws.com/...",
            size: "19999",
            senderId: "user-uuid",
            receiverId: "other-user-uuid",
            currentStatus: "ACTIVE",
            type: "Sent",
            createdAt: "2025-04-25T10:00:00.000Z",
            expiresAt: "2025-05-25T10:00:00.000Z",
        },
        {
            id: "file-uuid-2",
            name: "local.pdf",
            url: "https://s3.aws.com/...",
            size: "34434",
            senderId: "user-uuid",
            receiverId: "other-user-uuid",
            currentStatus: "DELETED",
            type: "Received",
            createdAt: "2025-04-24T16:00:00.000Z",
            expiresAt: "2025-05-25T10:00:00.000Z",
        },
    ];

    const fileSizeFormatter = (sizeInBytes: string): string => {
        const bytes = BigInt(sizeInBytes);

        const KB = BigInt(1024);
        const MB = KB * BigInt(1024);
        const GB = MB * BigInt(1024);

        if (bytes >= GB) {
            return `${(Number(bytes) / Number(GB)).toFixed(2)} GB`;
        } else if (bytes >= MB) {
            return `${(Number(bytes) / Number(MB)).toFixed(1)} MB`;
        } else if (bytes >= KB) {
            return `${(Number(bytes) / Number(KB)).toFixed(1)} KB`;
        } else {
            return `${bytes} B`;
        }
    };

    const dateFormatter = (dateString: string): string => {
        const date = new Date(dateString);

        const istFormat = date.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });

        return istFormat;
    };

    const getStatusBadge = (status: string) => {
        if (status === "ACTIVE") {
            return (
                <Badge
                    variant="outline"
                    className="font-bold text-sm bg-green-100 text-green-700 border-green-200"
                >
                    Active
                </Badge>
            );
        }
        if (status === "DELETED") {
            return (
                <Badge
                    variant="outline"
                    className="font-bold text-sm bg-red-100 text-red-700 border-red-200"
                >
                    Deleted
                </Badge>
            );
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "Sent":
                return <Upload className="h-4 w-4 text-blue-500" />;
            case "Received":
                return <Download className="h-4 w-4 text-green-500" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmiting(true);
        try {
            const res = await axios.post("/api/profile-update", {
                email,
                name,
            });
            setError("Updated successfully.");
            await getSession();
            if (session?.user) {
                session.user.name = name;
            }
        } catch (e) {
            setError(JSON.stringify(e));
        }
        setIsSubmiting(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <Toaster
                position="top-center"
                toastOptions={{
                    classNames: {
                        title: "md:text-lg",
                    },
                }}
            />
            <header className="border-b bg-white dark:bg-background">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                        <span className="text-lg md:text-2xl font-bold">
                            CipherShare
                        </span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/transfer"
                            className="text-sm lg:text-base font-medium hover:underline underline-offset-4"
                        >
                            File Transfer
                        </Link>
                        <div className="w-1 md:w-3 h-10 border-r border-zinc-300"></div>
                        <Button
                            variant="ghost"
                            title="Log out"
                            size="icon"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </nav>
                </div>
            </header>
            <main className="flex-1 container mx-auto py-12 px-4 md:px-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                    <div className="md:w-64 flex flex-col gap-6">
                        <div className="flex flex-col items-center text-center">
                            <div
                                className={`bg-muted rounded-full overflow-hidden h-24 w-24 mb-2 flex items-center justify-center ${
                                    session?.user?.image
                                        ? "border-0"
                                        : "border-[1px] border-zinc-300 cursor-pointer"
                                }`}
                            >
                                {session?.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt="user"
                                        width={100}
                                        height={100}
                                    />
                                ) : (
                                    <User height={40} width={40} />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                                {name || session?.user?.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {session?.user?.email}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Log Out
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Card className="mb-5">
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>
                                    View your recent file activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivity.length > 1 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-zinc-500 font-extrabold">
                                                        File
                                                    </TableHead>
                                                    <TableHead className="text-zinc-500 font-extrabold">
                                                        Type
                                                    </TableHead>
                                                    <TableHead className="text-zinc-500 font-extrabold">
                                                        Date
                                                    </TableHead>
                                                    <TableHead className="text-zinc-500 font-extrabold">
                                                        Size
                                                    </TableHead>
                                                    <TableHead className="text-zinc-500 font-extrabold">
                                                        Status
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentActivity.map(
                                                    (activity) => (
                                                        <TableRow
                                                            key={activity.id}
                                                        >
                                                            <TableCell className="font-bold">
                                                                {activity.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex font-bold items-center gap-2">
                                                                    {getActivityIcon(
                                                                        activity.type
                                                                    )}
                                                                    <span className="capitalize">
                                                                        {
                                                                            activity.type
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-bold">
                                                                {dateFormatter(
                                                                    activity.createdAt
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="font-bold">
                                                                {fileSizeFormatter(
                                                                    activity.size
                                                                )}
                                                            </TableCell>
                                                            {
                                                                <TableCell>
                                                                    {getStatusBadge(
                                                                        activity.currentStatus
                                                                    )}
                                                                </TableCell>
                                                            }
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-6">
                                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-medium">
                                                No activity yet
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Your file activity will appear
                                                here
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    Profile Information
                                </CardTitle>
                                <CardDescription>
                                    Update your account profile information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleProfileUpdate}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>

                                    {isEditing && (
                                        <Button
                                            type="submit"
                                            className="gap-2 mb-8"
                                            disabled={isSubmitting}
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSubmitting ? (
                                                <PulseLoader
                                                    size={6}
                                                    color={loaderColor}
                                                />
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </Button>
                                    )}

                                    <div className="space-y-2 cursor-not-allowed">
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            disabled
                                        />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <SessionProvider>
            <Profile />
        </SessionProvider>
    );
}
