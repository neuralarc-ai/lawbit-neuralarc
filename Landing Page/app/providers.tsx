"use client";

import { ParallaxProvider } from "react-scroll-parallax";
import { ToastProvider } from "@/components/Toast/Toaster";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ParallaxProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ParallaxProvider>
    );
}
