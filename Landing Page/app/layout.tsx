// app/layout.tsx
import "@/styles/app.sass";
import type { Metadata } from "next";
import localFont from 'next/font/local';
import Providers from "./providers";
import Script from "next/script";

// Configure Fustat font
const fustat = localFont({
  src: [
    {
      path: '../public/fonts/Fustat/Fustat-VariableFont_wght.ttf',
      style: 'normal',
      weight: '100 900'
    },
    {
      path: '../public/fonts/Fustat/Fustat-VariableFont_wght.ttf',
      style: 'italic',
      weight: '100 900'
    }
  ],
  display: 'swap',
  variable: '--font-fustat'
});

// Configure Space Mono font
const spaceMono = localFont({
  src: [
    {
      path: '../public/fonts/SpaceMono/SpaceMono-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SpaceMono/SpaceMono-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/SpaceMono/SpaceMono-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/SpaceMono/SpaceMono-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-space-mono'
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
                {/* Remove the Google Fonts link */}
                {/* Add preload for critical fonts */}
                <link
                    rel="preload"
                    href="/fonts/Fustat/Fustat-VariableFont_wght.ttf"
                    as="font"
                    type="font/ttf"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preload"
                    href="/fonts/SpaceMono/SpaceMono-Regular.ttf"
                    as="font"
                    type="font/ttf"
                    crossOrigin="anonymous"
                />
            </head>
            <body className={`bg-[#F8F7F3] grain-texture ${fustat.variable} ${spaceMono.variable}`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}