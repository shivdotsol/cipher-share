"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Check, X } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { signIn } from "next-auth/react";
import { PulseLoader } from "react-spinners";
import axios, { AxiosError, isAxiosError } from "axios";
import { useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { jwtDecode, JwtPayload } from "jwt-decode";

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [enteredOTP, setEnteredOTP] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { resolvedTheme } = useTheme();
    const loaderColor = resolvedTheme === "light" ? "#ffffff" : "#000000";

    interface OauthJwtPayload extends JwtPayload {
        name: string;
        email: string;
        picture: string;
    }

    const isInputValid = () => {
        const emailRegex =
            /^[a-zA-Z0-9._%+-]+[a-zA-Z0-9%+-]@[a-zA-Z0-9-]+\.(?:com|org|ru|net|de|uk|cn|jp|fr|in|br|it|nl|au|ca|co|es|pl|info|xyz|edu|gov|ai|io|eu|kr|se|ch|mx|be|biz|dk|no|cz|at|tr|us|id|sk|fi|tw|cl|ar|nz|hu|ie|pt|ro|sg|online)$/i;
        if (!emailRegex.test(email)) {
            setError("Invalid email format.");
            return false;
        } else if (password.length < 8) {
            setError("Password must be atleast 8 characters.");
            return false;
        } else {
            return true;
        }
    };

    const sendEmail = async () => {
        try {
            const res = await axios.post("/api/auth/send-otp", {
                email,
                firstName: name.split(" ")[0],
            });
        } catch {
            setError("Error while sending email");
            setIsOtpDialogOpen(false);
        }
    };
    const verifyEmail = async () => {
        try {
            const res = await axios.post("/api/auth/verify-otp", {
                email,
                otp: enteredOTP,
            });
            if (res.status === 200) {
                setIsOtpDialogOpen(false);
                setEnteredOTP("");
                handleSignup();
            }
        } catch {
            setError("Incorrect OTP");
        }
    };

    const onSignup = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInputValid()) {
            sendEmail();
            setIsOtpDialogOpen(true);
        }
    };

    const handleSignup = async () => {
        setIsSubmitting(true);
        try {
            const res = await axios.post("/api/auth/register", {
                name,
                email,
                password,
                authType: "EMAIL",
            });
            if (res.status == 200) {
                const signUpResponse = await signIn("credentials", {
                    name,
                    email,
                    password,
                    authType: "EMAIL",
                    redirect: false,
                    callbackUrl: "/",
                });
                router.push("/");
            }
        } catch (e) {
            if (isAxiosError(e)) {
                const err = e as AxiosError;
                setError(
                    err.status == 409
                        ? "Email already in use."
                        : "Internal Server Error"
                );
            } else {
                setError("Unknown error occurred.");
            }
        }

        setIsSubmitting(false);
    };

    const handleGoogleSignup = async (
        credentialResponse: CredentialResponse
    ) => {
        const decoded: OauthJwtPayload = jwtDecode(
            credentialResponse.credential || ""
        );
        try {
            const res = await axios.post("/api/auth/register", {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                authType: "GOOGLE",
            });

            if (res.status == 200) {
                const authRes = await signIn("credentials", {
                    name: decoded.name,
                    email: decoded.email,
                    authType: "GOOGLE",
                    redirect: false,
                    callbackUrl: "/",
                });
                if (authRes?.ok) {
                    router.push("/");
                } else {
                    setError("Unexpected error occurred.");
                }
            } else {
                setError("Unexpected error");
            }
        } catch (e) {
            if (isAxiosError(e)) {
                const err = e as AxiosError;
                setError(
                    err.status == 409
                        ? "Email already in use"
                        : "Internal Server Error"
                );
            } else {
                setError("Unknown error occurred");
            }
        }
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
            <Dialog open={isOtpDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Email OTP Verification</DialogTitle>
                        <DialogDescription>
                            An OTP has been sent on the given email, enter it
                            below to verify your email.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        id="name"
                        value={enteredOTP}
                        onChange={(e) => setEnteredOTP(e.target.value)}
                    />
                    <DialogFooter>
                        <Button
                            onClick={() => setIsOtpDialogOpen(false)}
                            variant={"outline"}
                        >
                            Cancel
                        </Button>
                        <Button onClick={verifyEmail}>Verify</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                            Create an account
                        </CardTitle>
                        <CardDescription>
                            Fill in your details to create a CipherShare account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

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
                                <div className="text-sm ml-1 text-muted-foreground">
                                    OTP verification required
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
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
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <PulseLoader size={8} color={loaderColor} />
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                            <div className="text-muted-foreground flex justify-center">
                                or
                            </div>

                            <div className="rounded-lg overflow-clip bg-gray-800">
                                <GoogleLogin
                                    onSuccess={(credentialResponse) =>
                                        handleGoogleSignup(credentialResponse)
                                    }
                                    onError={() =>
                                        setError("Google signup failed")
                                    }
                                />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-center text-sm text-muted-foreground w-full">
                            Already have an account?{" "}
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
