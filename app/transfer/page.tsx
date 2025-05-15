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
    AlertCircle,
    LoaderCircle,
    LucideLoaderCircle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
    encryptPrivateKeyWithPassphrase,
    encryptWithAES,
    encryptWithRSA,
    generateAesKey,
    generateKeyPair,
} from "@/lib/crypto";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { fromByteArray, toByteArray } from "base64-js";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TailSpin } from "react-loader-spinner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PulseLoader } from "react-spinners";
import { useTheme } from "next-themes";
import axios, { AxiosError, isAxiosError } from "axios";

function TransferPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [senderEmail, setSenderEmail] = useState(session?.user?.email);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadingMessage, setUploadingMessage] = useState(
        "Encrypting the file..."
    );
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);
    const { resolvedTheme } = useTheme();
    const loaderColor = resolvedTheme === "light" ? "#ffffff" : "#000000";

    const [downloadLink, setDownloadLink] = useState("");
    const [downloadKey, setDownloadKey] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const [downloadedFile, setDownloadedFile] = useState<{
        name: string;
        url: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (error.length > 0) {
            const errorContent = error;
            toast(errorContent);
            setError("");
        }
    }, [error]);

    useEffect(() => {
        if (status !== "authenticated") return;
        const handleDialogState = async () => {
            const keyExists = await checkForPrivateKeyInDb(
                session.user!.email!
            );
            setIsDialogOpen(!keyExists);
        };
        handleDialogState();
    }, [status]);

    async function checkForPrivateKeyInDb(email: string) {
        try {
            const res = await axios.post("/api/keys", {
                email,
            });

            if (res.status === 200) {
                return true;
            }
        } catch {
            return false;
        }
        return false;
    }

    // prompt the user for a passphrase
    // generate key pairs
    // encrypt the private key using the passphrase
    // store the encrypted private key in local storage
    // send the publicKey to the db

    async function handleKeyPairGeneration() {
        if (passphrase.length < 10) {
            setError("Passphrase must 10 characters or more");
            return;
        }
        setIsSubmitting(true);

        const keyPair = await generateKeyPair();
        const publicKey = await window.crypto.subtle.exportKey(
            "spki",
            keyPair.publicKey
        );

        const base64PublicKey = fromByteArray(new Uint8Array(publicKey));
        const encryptedPrivateKey = await encryptPrivateKeyWithPassphrase(
            keyPair.privateKey,
            passphrase
        );

        try {
            const res = await axios.put("/api/keys", {
                email: senderEmail,
                publicKey: base64PublicKey,
                privateKey: JSON.stringify(encryptedPrivateKey),
            });

            setIsDialogOpen(false);
        } catch (e) {
            setError("Error reaching the database, try again.");
        }

        setIsSubmitting(false);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////

    // protecting the route

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (status === "authenticated") {
            setSenderEmail(session.user?.email);
        }
    }, [status]);

    if (status === "unauthenticated") return null;
    if (status === "loading") return <h1>Loading...</h1>;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // to check if the recipient even has an account or have they generated their keys yet
    const validateRecipientEmail = async (email: string) => {
        try {
            const res = await axios.post("/api/keys", {
                email,
            });

            if (res.status === 200) {
                return true;
            }
        } catch (e) {
            if (isAxiosError(e)) {
                const err = e as AxiosError;
                if (err.status === 401) {
                    setError("User with that email doesn't exist.");
                } else if (err.status === 404) {
                    setError("Recipient hasn't generated their keys yet.");
                } else {
                    setError("Internal Server Error");
                }
            }
        }
        return false;
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        const fileSizeLimit = 1000 * 1024 * 1024; //  1000 MB
        // Will increase the size limit once I implement chunking
        if (file.size > fileSizeLimit) {
            setError("File size excedes 100 MB, please choose a smaller file.");
            return;
        }
        const recipientEmailValid =
            await validateRecipientEmail(recipientEmail);
        if (!recipientEmailValid) return;
        if (senderEmail === recipientEmail) {
            setError("You can't set yourself as the recipient.");
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        // first fetch the recipient's public key & convert into CryptoKey format

        let publicKey: CryptoKey;

        try {
            const res = await axios.post("/api/keys", {
                email: recipientEmail,
            });
            const base64PublicKey = res.data.publicKey;

            const keyBuffer = toByteArray(base64PublicKey);

            publicKey = await crypto.subtle.importKey(
                "spki",
                keyBuffer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["encrypt"]
            );
        } catch {
            setError("Error while processing recipient's public key.");
            setUploading(false);
            return;
        }

        setUploadProgress(40);

        // now encrypt and upload to s3
        try {
            await encryptAndUpload(publicKey);
            setUploadComplete(true);
        } catch (error) {
            setError("Upload failed");
            resetUpload();
        }
        setUploading(false);
    };

    const encryptAndUpload = async (publicKey: CryptoKey) => {
        if (!file) return;
        let s3Payload: {
            encryptedFile: { file: string; iv: string };
            encryptedAesKey: string;
        };

        // encrypt
        try {
            const aesKey = await generateAesKey();
            const encryptedFile = await encryptWithAES(file, aesKey); // encryptedFile
            const encryptedAesKey = await encryptWithRSA(aesKey, publicKey); // encrypted aes key

            s3Payload = { encryptedFile, encryptedAesKey };

            if (encryptedFile.file) {
                setError("File encrypted");
                setUploadProgress(65);
            }
        } catch {
            setError("Error while encrypting the file.");
            throw new Error("Error while encrypting");
        }

        // upload
        try {
            // get the preSignedUrl and Key
            const urlRes = await axios.get("/api/file/upload");
            setUploadProgress(85);
            const { url, key } = urlRes.data;
            // upload the file data
            setUploadingMessage("Uploading the file...");
            const res = await axios.put(url, s3Payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setUploadProgress(90);
            // update the files table in DB
            let fileData: FileInterface;
            if (senderEmail) {
                fileData = {
                    name: file.name,
                    size: file.size.toString(),
                    key,
                    currentStatus: "ACTIVE",
                    recipientEmail,
                    senderEmail,
                };
            } else {
                setError("Session error");
                return;
            }
            await updateFileInDb(fileData);
            setUploadProgress(100);
            setError("File uploaded");
        } catch (e) {
            // so that it ends up in the handleUpload() function's catch block
            throw new Error("Upload Failed");
        }
    };

    interface FileInterface {
        name: string;
        size: string;
        key: string;
        currentStatus: "EXPIRED" | "ACTIVE";
        recipientEmail: string;
        senderEmail: string;
    }

    const updateFileInDb = async ({
        name,
        size,
        key,
        currentStatus,
        recipientEmail,
        senderEmail,
    }: FileInterface) => {
        try {
            const res = await axios.put("/api/file", {
                name,
                size,
                key,
                currentStatus,
                recipientEmail,
                senderEmail,
            });
        } catch {
            setError("Error while updating the db.");
        }
    };

    const handleDownload = async () => {};

    const resetUpload = () => {
        setFile(null);
        setUploadComplete(false);
        setRecipientEmail("");
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

    return (
        <div className="flex flex-col min-h-screen">
            <Toaster
                position="top-center"
                toastOptions={{
                    classNames: {
                        title: "md:text-base",
                    },
                }}
            />
            <Dialog open={isDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Set a passphrase</DialogTitle>
                        <DialogDescription>
                            This will be used to encrypt and decrypt your
                            private key. Remember this or take a screenshot.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Set a passphrase (minimum 10 characters)"
                    />
                    <Alert variant={"destructive"} className="bg-red-50">
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            Do not lose this passphrase otherwise you won't be
                            able to decrypt received files.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button
                            onClick={handleKeyPairGeneration}
                            disabled={isSubmitting}
                            className="w-20"
                        >
                            {isSubmitting ? (
                                <PulseLoader size={8} color={loaderColor} />
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <header className="border-b">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                        <span className="text-xl md:text-2xl font-bold">
                            CipherShare
                        </span>
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
                                                        {uploadingMessage}
                                                    </span>
                                                    <span>
                                                        {uploadingMessage ===
                                                            "Uploading the file..." && (
                                                            <TailSpin
                                                                color="#000000"
                                                                height={20}
                                                                width={20}
                                                                strokeWidth={3}
                                                            />
                                                        )}
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
                                                    Enter the recipient's email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="recipient@example.com"
                                                    value={recipientEmail}
                                                    onChange={(e) =>
                                                        setRecipientEmail(
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
                                    <CardDescription className="mt-1">
                                        The uploaded file will be{" "}
                                        <strong>deleted after 24 hours</strong>{" "}
                                        for privacy reasons, make sure the
                                        recipient manages to download the file
                                        using their CipherShare account, before
                                        it expires.
                                    </CardDescription>
                                </CardHeader>
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

export default function Page() {
    return (
        <SessionProvider>
            <TransferPage />
        </SessionProvider>
    );
}
