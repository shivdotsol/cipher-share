"use client";

import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";

function ShareFileButton({ serverSession }: { serverSession: Session | null }) {
    const router = useRouter();
    const handleShareClick = () => {
        if (!serverSession?.user) {
            toast("Please login first.");
        } else {
            router.push("/transfer");
        }
    };
    return (
        <Button size="lg" className="gap-2" onClick={handleShareClick}>
            <Upload className="h-4 w-4" />
            Share a File
        </Button>
    );
}

export default ShareFileButton;
