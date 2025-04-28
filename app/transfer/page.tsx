"use client";

import { useState, useRef, type ChangeEvent, useEffect } from "react";
import Link from "next/link";
import {
    Shield,
    Upload,
    Download,
    Copy,
    Check,
    ArrowLeft,
    FileText,
    Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
    encryptWithAES,
    encryptWithRSA,
    generateAesKey,
    generateKeyPair,
} from "@/lib/crypto";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { fromByteArray, toByteArray } from "base64-js";

export default function TransferPage() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [receiverEmail, setReceiverEmail] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [fileLink, setFileLink] = useState("");
    const [decryptionKey, setDecryptionKey] = useState("");
    const [linkCopied, setLinkCopied] = useState(false);
    const [keyCopied, setKeyCopied] = useState(false);

    const [downloadLink, setDownloadLink] = useState("");
    const [downloadKey, setDownloadKey] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const [downloadedFile, setDownloadedFile] = useState<{
        name: string;
        url: string;
    } | null>(null);

    useEffect(() => {
        if (error.length > 0) {
            const errorContent = error;
            toast(errorContent);
            setError("");
        }
    }, [error]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            await handleEncryptionAndUpload();

            // add the s3 url as file link

            setFileLink(`https://ciphershare.com/f/`);
            // setUploadComplete(true);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async () => {
        if (!downloadLink || !downloadKey) return;

        setDownloading(true);
        setDownloadProgress(0);

        try {
            // Simulate download and decryption process
            await simulateDownloadAndDecryption();

            // Create a fake downloaded file
            const fileName = "downloaded-file.pdf";
            setDownloadedFile({
                name: fileName,
                url: "#", // In a real app, this would be a blob URL
            });
            setDownloadComplete(true);
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setDownloading(false);
        }
    };

    const copyToClipboard = (text: string, type: "link" | "key") => {
        navigator.clipboard.writeText(text);
        if (type === "link") {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } else {
            setKeyCopied(true);
            setTimeout(() => setKeyCopied(false), 2000);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setUploadComplete(false);
        setFileLink("");
        setDecryptionKey("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const resetDownload = () => {
        setDownloadComplete(false);
        setDownloadedFile(null);
        setDownloadLink("");
        setDownloadKey("");
    };

    const handleEncryptionAndUpload = async () => {
        if (!file) {
            setError("No file selected.");
            return;
        }

        try {
            const { publicKey, privateKey } = await generateKeyPair();
            const fileArrayBuffer = await file.arrayBuffer();
            const aesKey = await generateAesKey();
            const encryptedFile = await encryptWithAES(fileArrayBuffer, aesKey);
            const encryptedAesKey = await encryptWithRSA(aesKey, publicKey);
            const exportedPrivateKey = await window.crypto.subtle.exportKey(
                "pkcs8",
                privateKey
            );
            const base64PrivateKey = fromByteArray(
                new Uint8Array(exportedPrivateKey)
            ); // this will be displayed to the user

            setDecryptionKey(base64PrivateKey);

            if (encryptedFile) {
                setError("file encrypted");
                setUploadProgress(40);
            }
        } catch {
            setError("Error while encrypting the file.");
        }
    };

    const simulateDownloadAndDecryption = async () => {
        // Simulate download and decryption with progress
        const totalSteps = 100;
        for (let i = 0; i <= totalSteps; i++) {
            setDownloadProgress(i);
            await new Promise((resolve) => setTimeout(resolve, 30));
        }
    };

    const generateRandomString = (length: number) => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Toaster
                position="top-center"
                toastOptions={{
                    classNames: {
                        title: "md:text-lg",
                    },
                }}
            />
            <header className="border-b">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">CipherShare</span>
                    </Link>
                </div>
            </header>
            <main className="flex-1 container mx-auto max-w-4xl py-12 px-4 md:px-6">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                <h1 className="text-3xl font-bold tracking-tighter mb-6">
                    Secure File Transfer
                </h1>

                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger
                            value="upload"
                            className="flex items-center gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Encrypt & Upload
                        </TabsTrigger>
                        <TabsTrigger
                            value="download"
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download & Decrypt
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload">
                        {!uploadComplete ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upload a File</CardTitle>
                                    <CardDescription>
                                        Your file will be encrypted in your
                                        browser before being uploaded.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="file">
                                                Select a file to encrypt and
                                                share
                                            </Label>
                                            <Input
                                                id="file"
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                disabled={uploading}
                                            />
                                        </div>

                                        {file && (
                                            <Alert>
                                                <FileText className="h-4 w-4" />
                                                <AlertDescription>
                                                    Selected file: {file.name} (
                                                    {(
                                                        file.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB)
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {uploading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        Encrypting and
                                                        uploading...
                                                    </span>
                                                    <span>
                                                        {uploadProgress}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={uploadProgress}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardContent>
                                    <form onSubmit={handleUpload}>
                                        <div className="space-y-4 mb-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Enter the receiver's email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    onChange={(e) =>
                                                        setReceiverEmail(
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    disabled={uploading}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={!file || uploading}
                                            className="w-full"
                                        >
                                            {uploading
                                                ? "Processing..."
                                                : "Encrypt & Upload"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        File Uploaded Successfully
                                    </CardTitle>
                                    <CardDescription>
                                        Share the link and decryption key with
                                        your recipient.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="file-link">
                                                File Link
                                            </Label>
                                            <div className="flex">
                                                <Input
                                                    id="file-link"
                                                    value={fileLink}
                                                    readOnly
                                                    className="rounded-r-none"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-l-none"
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            fileLink,
                                                            "link"
                                                        )
                                                    }
                                                >
                                                    {linkCopied ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="decryption-key">
                                                Decryption Key
                                            </Label>
                                            <div className="flex">
                                                <Input
                                                    id="decryption-key"
                                                    value={decryptionKey}
                                                    readOnly
                                                    className="rounded-r-none font-mono text-sm"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-l-none"
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            decryptionKey,
                                                            "key"
                                                        )
                                                    }
                                                >
                                                    {keyCopied ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <Alert>
                                            <Lock className="h-4 w-4" />
                                            <AlertDescription>
                                                Important: Share the decryption
                                                key through a different medium
                                                than the file link for maximum
                                                security.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={resetUpload}
                                        className="w-full"
                                    >
                                        Upload Another File
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="download">
                        {!downloadComplete ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Download & Decrypt a File
                                    </CardTitle>
                                    <CardDescription>
                                        Enter the file link and decryption key
                                        to download and decrypt the file.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="download-link">
                                                Enter the file link here
                                            </Label>
                                            <Input
                                                id="download-link"
                                                placeholder="https://s3.aws.com/..."
                                                value={downloadLink}
                                                onChange={(e) =>
                                                    setDownloadLink(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={downloading}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="download-key">
                                                Enter the decryption key
                                            </Label>
                                            <Input
                                                id="download-key"
                                                value={downloadKey}
                                                onChange={(e) =>
                                                    setDownloadKey(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={downloading}
                                                className="font-mono text-sm"
                                            />
                                        </div>

                                        {downloading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        Downloading and
                                                        decrypting...
                                                    </span>
                                                    <span>
                                                        {downloadProgress}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={downloadProgress}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handleDownload}
                                        disabled={
                                            !downloadLink ||
                                            !downloadKey ||
                                            downloading
                                        }
                                        className="w-full"
                                    >
                                        {downloading
                                            ? "Processing..."
                                            : "Download & Decrypt"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        File Downloaded Successfully
                                    </CardTitle>
                                    <CardDescription>
                                        Your file has been downloaded and
                                        decrypted.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Alert>
                                            <FileText className="h-4 w-4" />
                                            <AlertDescription>
                                                {downloadedFile?.name}
                                            </AlertDescription>
                                        </Alert>

                                        <div className="flex justify-center">
                                            <Button asChild>
                                                <a
                                                    href={downloadedFile?.url}
                                                    download={
                                                        downloadedFile?.name
                                                    }
                                                >
                                                    Save File
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={resetDownload}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Download Another File
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
            <footer className="border-t">
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
