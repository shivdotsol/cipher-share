"use client";

import type React from "react";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { PulseLoader } from "react-spinners";
import { useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Loading from "@/app/Loading";

function Page() {
    const router = useRouter();
    const searchparams = useSearchParams();
    const [urlError, setUrlError] = useState(searchparams.get("error"));
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { resolvedTheme } = useTheme();
    const loaderColor = resolvedTheme === "light" ? "#ffffff" : "#000000";

    const handleLogin = async (e: React.FormEvent) => {
        setIsSubmitting(true);
        e.preventDefault();
        const loginResponse = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/",
        });
        if (loginResponse?.ok) {
            router.push("/");
        } else {
            setError(
                loginResponse?.error?.split(":")[1] || "Error while logging in"
            );
        }
        setIsSubmitting(false);
    };

    const handleGoogleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const googleLoginResponse = await signIn("google", {
            redirect: false,
            callbackUrl: "/",
        });
        if (googleLoginResponse?.url) {
            router.push("/");
        }
    };

    useEffect(() => {
        if (error.length > 0) {
            const errorText = error;
            toast(errorText);
            setError("");
        }
        if (urlError) {
            toast(urlError == "user-not-found" ? "User not found" : urlError);
        }
    }, [error, urlError]);

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
                        <Shield className="h-7 w-7 text-primary" />
                        <span className="text-2xl font-bold">CipherShare</span>
                    </Link>
                </div>
            </header>
            <main className="flex-1 container mx-auto max-w-md py-12 md:py-32 px-4 md:px-6">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            Log in
                        </CardTitle>
                        <CardDescription>
                            Fill in your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">
                                            {showPassword
                                                ? "Hide password"
                                                : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm ml-1 text-muted-foreground hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <PulseLoader size={8} color={loaderColor} />
                                ) : (
                                    "Log in"
                                )}
                            </Button>
                            <div className="text-muted-foreground flex justify-center">
                                or
                            </div>
                            <Button
                                className="w-full h-10 font-normal bg-white text-gray-700 border-[1px] hover:bg-sky-50 cursor-pointer"
                                onClick={handleGoogleLogin}
                            >
                                <FcGoogle />
                                <div className="w-[90%]">Login with Google</div>
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-center text-sm text-muted-foreground w-full">
                            Don't have an account?{" "}
                            <Link
                                href="/signup"
                                className="text-primary hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </main>
            <footer className="border-t bg-white dark:bg-background">
                <div className="container mx-auto flex flex-col gap-2 py-6 px-4 md:px-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold">
                            CipherShare
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} CipherShare. All
                        rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<Loading />}>
            <Page />
        </Suspense>
    );
}
