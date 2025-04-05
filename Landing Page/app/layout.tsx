import "@/styles/app.sass";
import type { Metadata } from "next";
import { Fustat } from "next/font/google";
import Providers from "./providers";
import Script from "next/script";

const fustat = Fustat({
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    subsets: ["latin"],
    display: "block",
    variable: "--font-fustat",
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
        <html lang="en" className={`${fustat.variable}`}>
            <head>
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
                <meta name="twitter:creator" content="@ui8" />
                {/* Twitter Summary card images must be at least 120x120px */}
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta`}
                    strategy="beforeInteractive"
                />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
