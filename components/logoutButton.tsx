"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

function LogoutButton() {
    return (
        <Button
            variant={"ghost"}
            className="h-8 w-full p-0 pl-2 flex justify-start font-bold text-red-600 hover:text-red-800 hover:bg-red-100 cursor-pointer"
            onClick={() => signOut()}
        >
            Logout
        </Button>
    );
}

export default LogoutButton;
