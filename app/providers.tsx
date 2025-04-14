"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute={"class"} defaultTheme="light" enableSystem>
            <GoogleOAuthProvider clientId="1041636635434-0t5kbn28946fcpk6not668orokf6pf6h.apps.googleusercontent.com">
                {children}
            </GoogleOAuthProvider>
        </ThemeProvider>
    );
}

export default Providers;
