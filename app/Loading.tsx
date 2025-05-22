"use client";

import { InfinitySpin } from "react-loader-spinner";

export default function Loading() {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <InfinitySpin color="#475569" />
        </div>
    );
}
