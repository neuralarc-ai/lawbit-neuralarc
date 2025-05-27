"use client";

import { ParallaxProvider } from "react-scroll-parallax";
import SupabaseProvider from '@/components/Providers/SupabaseProvider'
import { ToastProvider } from "@/components/Toast/Toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SupabaseProvider>
            <ParallaxProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </ParallaxProvider>
        </SupabaseProvider>
    );
}
