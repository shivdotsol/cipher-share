"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return null;
    }

    return (
        <div>
            {resolvedTheme == "light" ? (
                <Moon
                    size={24}
                    className="cursor-pointer opacity-85"
                    onClick={() =>
                        setTheme(resolvedTheme == "light" ? "dark" : "light")
                    }
                />
            ) : (
                <Sun
                    size={24}
                    className="cursor-pointer opacity-85"
                    onClick={() =>
                        setTheme(resolvedTheme == "light" ? "dark" : "light")
                    }
                />
            )}
        </div>
    );
}

export default ThemeToggle;
