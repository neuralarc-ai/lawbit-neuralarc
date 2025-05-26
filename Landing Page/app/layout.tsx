import "@/styles/app.sass";
import type { Metadata } from "next";
import { Fustat, Space_Mono } from 'next/font/google';
import Providers from "./providers";
import Script from "next/script";

// Configure Fustat font with all weights
const fustat = Fustat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fustat',
  weight: ['200', '300', '400', '500', '600', '700', '800']
});

// Configure Space Mono font
const spaceMono = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-mono',
  weight: ['400', '700']
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
        <html lang="en" className={`${fustat.variable} ${spaceMono.variable} font-sans`} style={{ fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1' }}>
            <head>
                {/* Preconnect to Google Fonts */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link href="https://fonts.googleapis.com/css2?family=Fustat:wght@200..800&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
                {/* Preload critical font files */}
                <link 
                    rel="preload" 
                    href="https://fonts.gstatic.com/s/fustat/v1/7cHrv4wK2MnH0U3Z5Xc8Q3XU.woff2" 
                    as="font" 
                    type="font/woff2" 
                    crossOrigin="anonymous"
                />
                
                
                {/* Standard font loading as fallback */}
                <link 
                    href="https://fonts.googleapis.com/css2?family=Fustat:wght@200..800&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" 
                    rel="stylesheet"
                    crossOrigin="anonymous"
                />
                
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
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta`}
                    strategy="beforeInteractive"
                />
            </head>
            <body className={`bg-[#F8F7F3] grain-texture ${fustat.variable} ${spaceMono.variable}`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
