import "@/styles/app.sass";
import type { Metadata } from "next";
import { Fustat, Space_Mono } from "next/font/google";
import Providers from "./providers";
import Script from "next/script";

const fustat = Fustat({
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-fustat",
});

const spaceMono = Space_Mono({
    weight: ["400", "700"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-space-mono",
});

export const metadata: Metadata = {
    title: "Lawbit - AI for Legal Intelligence",
    description: "AI for Legal Intelligence",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${fustat.variable} ${spaceMono.variable}`}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Fustat:wght@200..800&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
            
                {/* Description no longer than 155 characters */}
                <meta name="description" content="AI for Legal Intelligence" />
                {/* Product Name */}
                <meta name="product-name" content="Lawbit" />
                {/* Twitter Card data */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@ampersand" />
                <meta name="twitter:title" content="Lawbit - AI for Legal Intelligence" />
                <meta
                    name="twitter:description"
                    content="Lawbit - AI for Legal Intelligence"
                />
                {/* Twitter Summary card images must be at least 120x120px */}
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta`}
                    strategy="beforeInteractive"
                />
            </head>
            <body className="grain-texture bg-[#F8F7F3]">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
