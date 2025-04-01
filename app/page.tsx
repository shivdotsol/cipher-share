import Link from "next/link";
import Image from "next/image";
import { Shield, Lock, Share2, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between m-auto px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Shield className="h-7 w-7 text-primary" />
                        <span className="text-2xl font-bold">CipherShare</span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="#features"
                            className="text-md font-medium hover:underline underline-offset-4"
                        >
                            Features
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="text-md font-medium hover:underline underline-offset-4"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="#security"
                            className="text-md font-medium hover:underline underline-offset-4"
                        >
                            Security
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/transfer">
                            <Button className="text-md py-5">
                                Start Sharing
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-4 md:px-6 m-auto">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Truly End-to-End Encrypted
                                </h1>
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    File Sharing System
                                </h1>
                                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    {
                                        "Your files stay private—always. We encrypt with the recipient's public key, and only they can decrypt it. No stored private keys, no third-party access. Fast, reliable, and built for true privacy. Share with confidence, knowing only the right eyes see your data."
                                    }
                                </p>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Link href="/transfer">
                                        <Button size="lg" className="gap-2">
                                            <Upload className="h-4 w-4" />
                                            Share a File
                                        </Button>
                                    </Link>
                                    <Link href="#how-it-works">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            Learn More
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="relative h-[350px] w-full overflow-hidden rounded-xl">
                                <Image
                                    src="/hero-bg.png"
                                    alt="Secure file sharing"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="features"
                    className="w-full py-12 md:py-24 lg:py-32"
                >
                    <div className="container m-auto px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Key Features
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    CipherShare combines security with
                                    simplicity to provide the best file sharing
                                    experience.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3 lg:gap-12 ">
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Lock className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">
                                    End-to-End Encryption
                                </h3>
                                <p className="text-muted-foreground">
                                    Files are encrypted on your device before
                                    upload. Only recipients with the decryption
                                    key can access them.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Share2 className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">
                                    Simple Sharing
                                </h3>
                                <p className="text-muted-foreground">
                                    Share encrypted files with anyone using a
                                    secure link and a separate decryption key.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <CheckCircle className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">
                                    Seamless Registration
                                </h3>
                                <p className="text-muted-foreground">
                                    Start sharing files immediately by creating
                                    an account with google or via email.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="how-it-works"
                    className="w-full py-12 md:py-24 lg:py-32 bg-muted"
                >
                    <div className="container m-auto px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    How It Works
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    CipherShare makes secure file sharing simple
                                    in just a few steps.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <span className="text-xl font-bold">1</span>
                                </div>
                                <h3 className="text-xl font-bold">Upload</h3>
                                <p className="text-muted-foreground">
                                    Select your file and it will be encrypted in
                                    your browser before being uploaded to our
                                    secure servers.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <span className="text-xl font-bold">2</span>
                                </div>
                                <h3 className="text-xl font-bold">Share</h3>
                                <p className="text-muted-foreground">
                                    Receive a secure download link and a
                                    separate decryption key to share with your
                                    recipient.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <span className="text-xl font-bold">3</span>
                                </div>
                                <h3 className="text-xl font-bold">Download</h3>
                                <p className="text-muted-foreground">
                                    Recipients use the link to download the
                                    encrypted file and the key to decrypt it on
                                    their device.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="security"
                    className="w-full py-12 md:py-24 lg:py-32"
                >
                    <div className="container m-auto px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Security You Can Trust
                                </h2>
                                <p className="text-muted-foreground md:text-xl/relaxed">
                                    CipherShare uses AES-256 encryption, the
                                    same standard used by governments and
                                    financial institutions worldwide.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        <span>
                                            Client-side encryption ensures your
                                            data never leaves your device
                                            unprotected
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        <span>
                                            Files are stored on AWS S3 with
                                            additional server-side encryption
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        <span>
                                            Encryption keys are never stored on
                                            our servers
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        <span>
                                            Optional file expiration ensures
                                            your data doesn't remain stored
                                            indefinitely
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative h-[350px] w-full overflow-hidden rounded-xl">
                                <Image
                                    src="/aes256.png"
                                    alt="Security illustration"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
                    <div className="container m-auto px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Ready to Share Securely?
                                </h2>
                                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Start using CipherShare today - no
                                    subscription required.
                                </p>
                            </div>
                            <div className="mx-auto w-full max-w-sm space-y-2">
                                <Link href="/transfer">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="w-full"
                                    >
                                        Start Sharing Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="border-t">
                <div className="container m-auto flex flex-col gap-2 py-6 px-4 md:px-6 md:flex-row md:gap-6 md:items-center md:justify-center">
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
