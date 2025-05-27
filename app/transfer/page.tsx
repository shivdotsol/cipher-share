"use client";

import React, { useState, useRef, type ChangeEvent, useEffect } from "react";
import Link from "next/link";
import {
    Shield,
    Upload,
    Download,
    ArrowLeft,
    FileText,
    AlertCircle,
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
    decryptPrivateKeyWithPassphrase,
    decryptWithAes,
    decryptWithRSA,
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
import { InfinitySpin, TailSpin } from "react-loader-spinner";
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
import Loading from "../Loading";
import FileListItem from "@/components/FileListItem";
import StatusBar from "@/components/StatusBar";

function TransferPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [confirmPassphrase, setConfirmPassphrase] = useState("");
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

    const [isCheckingFilesToDownload, setIsCheckingFilesToDownload] =
        useState(false);
    const [fileList, setFileList] = useState<FileListInterface[]>([]);
    const [encryptedFileData, setEncryptedFileData] =
        useState<EncryptedFileData>();
    const [decryptionPassphrase, setDecryptionPassphrase] = useState("");
    const [isPassphraseInputVisible, setIsPassphraseInputVisible] =
        useState(false);
    const [isStatusBarVisible, setIsStatusBarVisible] = useState(false);
    const [statusBarText, setStatusBarText] = useState("");
    const [downloadedFileName, setDownloadedFileName] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    interface FileInterface {
        name: string;
        size: string;
        key: string;
        currentStatus: "EXPIRED" | "ACTIVE";
        recipientEmail: string;
        senderEmail: string;
    }

    interface FileListInterface {
        name: string;
        size: string;
        key: string;
        currentStatus: "EXPIRED" | "ACTIVE";
        recipientEmail: string;
        senderEmail: string;
        id: string;
        createdAt: Date;
    }

    interface PrivateKeyObject {
        privateKey: string;
        salt: string;
        iv: string;
    }

    interface EncryptedFileData {
        encryptedFile: {
            file: string;
            iv: string;
        };
        encryptedAesKey: string;
    }

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
    // encrypt the private key using an AES key generated with the passphrase
    // store the encrypted private key in local storage
    // send the publicKey to the db

    async function handleKeyPairGeneration() {
        if (passphrase.length < 10) {
            setError("Passphrase must 10 characters or more");
            return;
        } else if (passphrase !== confirmPassphrase) {
            setError("Passphrases don't match.");
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
    if (status === "loading") return <Loading />;

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

    // functions for the download part

    const checkDbForFiles = async () => {
        setIsCheckingFilesToDownload(true);
        try {
            const res = await axios.post("/api/file/download", {
                email: senderEmail,
            });
            const activeFiles: FileListInterface[] = res.data.filter(
                (item: FileListInterface) => item.currentStatus === "ACTIVE"
            );

            setFileList(activeFiles.reverse());
        } catch {
            setError("Error while fetching files.");
        }
        setIsCheckingFilesToDownload(false);
    };

    const fetchPrivateKeyFromDb = async (): Promise<PrivateKeyObject> => {
        try {
            const res = await axios.post("/api/keys/private-key", {
                email: senderEmail,
            });
            const privateKeyObject: PrivateKeyObject = JSON.parse(
                res.data.privateKey
            );
            return privateKeyObject;
        } catch {
            setError("Error while fetching private key.");
        }
        return { privateKey: "", salt: "", iv: "" };
    };

    const decryptFileData = async (e: React.FormEvent) => {
        // fetch encrypted private key form db
        // ask for passphrase and generate an AES key from that
        // decrypt the private key using this AES key
        // now decrypt the AES key that was used to encrypt the file
        // finally decrypt the file using this AES
        e.preventDefault();
        setDownloading(true);
        setIsStatusBarVisible(true);
        setDownloadProgress(10);

        //////////////////////////////////////////////////////////////
        setStatusBarText(
            "Step 1/4 - Fetching private key from the database..."
        );
        const { privateKey, salt, iv } = await fetchPrivateKeyFromDb();
        if (!(privateKey.length > 0)) {
            return;
        }
        setDownloadProgress(30);

        ///////////////////////////////////////////////////////////////
        setStatusBarText(
            "Step 2/4 - Decrypting private key with passphrase..."
        );

        let decryptedPrivateKey: CryptoKey;

        // might throw if the passphrase is incorrect
        try {
            decryptedPrivateKey = await decryptPrivateKeyWithPassphrase(
                privateKey,
                salt,
                iv,
                decryptionPassphrase
            );
        } catch (e) {
            console.log(e);
            setError("Incorrect passphrase, try again.");
            resetDownload();
            return;
        }

        setDownloadProgress(55);

        ///////////////////////////////////////////////////////////////
        setStatusBarText(
            "Step 2/3 - Decrypting the AES key with the private key..."
        );

        if (!encryptedFileData) {
            setError("Error while downloading data, try again.");
            resetDownload();
            return;
        }
        const decryptedAesKey = await decryptWithRSA(
            encryptedFileData.encryptedAesKey,
            decryptedPrivateKey
        );

        setDownloadProgress(75);

        ////////////////////////////////////////////////////////////////
        setStatusBarText("Step 3/3 - Decrypting file data with AES key...");

        const fileBuffer = await decryptWithAes(
            encryptedFileData.encryptedFile.file,
            encryptedFileData.encryptedFile.iv,
            decryptedAesKey
        );

        setDownloadProgress(100);

        const finalFile = new File([fileBuffer], downloadedFileName);

        setStatusBarText("Done");

        downloadFile(finalFile);

        resetDownload();
    };

    const handleDownload = async (key: string, name: string) => {
        setError("Attempting to download.");
        try {
            const res = await axios.post("/api/file/download/presigned-url", {
                key,
            });
            const { data: encryptedFileData } = await axios.get(res.data);
            setEncryptedFileData(encryptedFileData);
            setDownloadedFileName(name);
            setIsPassphraseInputVisible(true);
            setError("Enter passphrase.");
        } catch {
            setError("error while downloading");
        }
    };

    const resetUpload = () => {
        setFile(null);
        setUploadComplete(false);
        setRecipientEmail("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    function downloadFile(file: File) {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        // clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const resetDownload = () => {
        setDecryptionPassphrase("");
        setIsPassphraseInputVisible(false);
        setIsStatusBarVisible(false);
        setDownloading(false);
        setDownloadComplete(false);
    };

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
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });

        return istFormat;
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
                    <DialogHeader className="mb-2">
                        <DialogTitle>Set a passphrase</DialogTitle>
                        <DialogDescription>
                            This will be used to encrypt and decrypt your
                            private key. Remember this or take a screenshot.
                        </DialogDescription>
                    </DialogHeader>
                    <Label htmlFor="passphrase">Enter passphrase</Label>
                    <Input
                        id="passphrase"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="set a passphrase (minimum 10 characters)"
                    />
                    <Label htmlFor="confirm-passphrase">
                        Confirm passphrase
                    </Label>
                    <Input
                        id="confirm-passphrase"
                        className="mb-2"
                        value={confirmPassphrase}
                        onChange={(e) => setConfirmPassphrase(e.target.value)}
                        placeholder="confirm passphrase"
                    />
                    <Alert
                        variant={"destructive"}
                        className={
                            resolvedTheme === "light"
                                ? "bg-red-50"
                                : "bg-red-950"
                        }
                    >
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            Do not lose this passphrase otherwise you won't be
                            able to decrypt received files.
                        </AlertDescription>
                    </Alert>
                    <Alert
                        variant={"destructive"}
                        className={
                            resolvedTheme === "light"
                                ? "bg-red-100"
                                : "bg-red-900"
                        }
                    >
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>
                            Take a screenshot or write it somewhere.
                        </AlertTitle>
                        <AlertDescription>
                            Make sure you save it before submitting.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button
                            onClick={handleKeyPairGeneration}
                            disabled={isSubmitting}
                            className="w-20 font-bold"
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
                            onClick={checkDbForFiles}
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
                        {isCheckingFilesToDownload ? (
                            <div className="flex items-center justify-center ">
                                <InfinitySpin color={"#475569"} />
                            </div>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Download & Decrypt a File
                                    </CardTitle>
                                    <CardDescription>
                                        {fileList.length > 0 &&
                                            "Below are the files that were sent to you within the past 24 hours."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {fileList.length < 1 && (
                                        <div className="text-center py-6">
                                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-medium">
                                                Nothing to download
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                No files were sent to you in the
                                                past 24 hours.
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-4 mb-2">
                                        <div className="space-y-2">
                                            {fileList &&
                                                fileList[0] &&
                                                fileList.map((f) => (
                                                    <div
                                                        key={f.id}
                                                        className="flex gap-x-2 items-center relative "
                                                    >
                                                        <div
                                                            className="w-full"
                                                            onClick={() =>
                                                                handleDownload(
                                                                    f.key,
                                                                    f.name
                                                                )
                                                            }
                                                        >
                                                            <FileListItem
                                                                name={f.name}
                                                                senderEmail={
                                                                    f.senderEmail
                                                                }
                                                                size={fileSizeFormatter(
                                                                    f.size
                                                                )}
                                                                date={dateFormatter(
                                                                    f.createdAt.toString()
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        {isPassphraseInputVisible && (
                                            <form onSubmit={decryptFileData}>
                                                <div className="space-y-2">
                                                    <Label htmlFor="decryptionPassphrase">
                                                        Enter the passphrase
                                                    </Label>
                                                    <Input
                                                        id="decryptionPassphrase"
                                                        value={
                                                            decryptionPassphrase
                                                        }
                                                        placeholder="to decrypt your private key"
                                                        onChange={(e) =>
                                                            setDecryptionPassphrase(
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={downloading}
                                                        className="font-mono text-sm"
                                                    />
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            decryptionPassphrase.length <
                                                                10 ||
                                                            downloading
                                                        }
                                                        className="w-full"
                                                    >
                                                        {downloading
                                                            ? "Processing..."
                                                            : "Download & Decrypt"}
                                                    </Button>
                                                </div>
                                            </form>
                                        )}

                                        {isStatusBarVisible && (
                                            <StatusBar
                                                statusBarText={statusBarText}
                                                downloadProgress={
                                                    downloadProgress
                                                }
                                            />
                                        )}
                                    </div>
                                    {!isStatusBarVisible &&
                                        fileList.length > 0 && (
                                            <CardDescription>
                                                Click on the file you would like
                                                to download.
                                            </CardDescription>
                                        )}
                                </CardContent>
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
