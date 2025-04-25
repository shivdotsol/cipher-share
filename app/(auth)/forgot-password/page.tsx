"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, EyeOff, Eye } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { PulseLoader } from "react-spinners";
import { useTheme } from "next-themes";
import axios, { AxiosError, isAxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [enteredOTP, setEnteredOTP] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
    const { resolvedTheme } = useTheme();
    const loaderColor = resolvedTheme === "light" ? "#ffffff" : "#000000";

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!email) {
            setError("Please enter your email address");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await axios.post("/api/auth/send-otp/forgot-password", {
                email,
            });

            if (res.status == 200) {
                setOtpSent(true);
                setError("Email sent");
            }
        } catch (e) {
            if (isAxiosError(e)) {
                const err = e as AxiosError;
                console.log(err);
                if (err.status === 404) {
                    setError("Account does not exist.");
                } else if (err.status === 500) {
                    setError("Internal Server Error");
                } else {
                    setError("Unknown error occurred.");
                }
            } else {
                console.log(e);
                setError("Something went wrong.");
            }
        }
        setIsSubmitting(false);
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // validate the OTP
        try {
            const res = await axios.post(
                "/api/auth/verify-otp/forgot-password",
                {
                    email,
                    otp: enteredOTP,
                }
            );
            if (res.status === 200) {
                setError("Email verified successfully.");
                setIsOtpSubmitted(true);
            }
        } catch (e) {
            if (isAxiosError(e)) {
                const err = e as AxiosError;
                if (err.status === 401) {
                    setError("Incorrect OTP");
                } else if (err.status === 403) {
                    setError("OTP expired, generate again.");
                }
            } else {
                setError("Unknown error occurred.");
            }
        }
        setIsSubmitting(false);
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError("Password must be atleast 8 characters.");
            return;
        } else if (password !== password2) {
            setError("Passwords don't match.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await axios.post("/api/auth/reset-password", {
                email,
                password,
            });
            if (res.status === 200) {
                setError(
                    "Password changed successfully. Redirecting to login."
                );
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }
        } catch (e) {
            setError("Something went wrong.");
        }
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (error.length > 0) {
            const errorContent = error;
            toast(errorContent);
            setError("");
        }
    }, [error]);

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
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">CipherShare</span>
                    </Link>
                </div>
            </header>
            <main className="flex-1 container mx-auto max-w-md py-12 px-4 md:px-6">
                <div className="mb-8">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            Reset your password
                        </CardTitle>
                        {!otpSent && (
                            <CardDescription>
                                Enter your email address and we'll send you a
                                One Time Password to verify that this email
                                belongs to you.
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!otpSent ? (
                            <form
                                onSubmit={handleEmailSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <PulseLoader
                                            size={8}
                                            color={loaderColor}
                                        />
                                    ) : (
                                        "Send OTP"
                                    )}
                                </Button>
                            </form>
                        ) : otpSent && !isOtpSubmitted ? (
                            <form onSubmit={handleOtpSubmit}>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Please check your email and enter the
                                        OTP here. The OTP will expire in 5
                                        minutes.
                                    </p>
                                    <div className="space-y-2">
                                        <Label htmlFor="otp">OTP</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            value={enteredOTP}
                                            onChange={(e) =>
                                                setEnteredOTP(e.target.value)
                                            }
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <PulseLoader
                                                size={8}
                                                color={loaderColor}
                                            />
                                        ) : (
                                            "Submit"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form
                                onSubmit={handlePasswordReset}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        New password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
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
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password2">
                                        Confirm password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password2"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password2}
                                            onChange={(e) =>
                                                setPassword2(e.target.value)
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
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <PulseLoader
                                            size={8}
                                            color={loaderColor}
                                        />
                                    ) : (
                                        "Reset password"
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter>
                        <p className="text-center text-sm text-muted-foreground w-full">
                            Remember your password?{" "}
                            <Link
                                href="/login"
                                className="text-primary hover:underline"
                            >
                                Log in
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
