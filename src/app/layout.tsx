import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { QueryProvider } from "@/providers/query-provider";
import { TelegramAutoAuth } from "@/providers/telegram-auto-auth";
import { NavProgress } from "@/components/elevo/layout/nav-progress";
import { AppHeader } from "@/components/elevo/layout/app-header";
import { BottomNav } from "@/components/elevo/layout/bottom-nav";
import { DevConsole } from "@/components/dev/dev-console";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Elevo — Multilevel Language Platform",
    description: "Professional til o'rganish platformasi",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
        { media: "(prefers-color-scheme: dark)",  color: "#09090b" },
    ],
    colorScheme: "light dark",
};

import Script from "next/script";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
                <Script id="tg-init" strategy="beforeInteractive">
                  {`
                    try {
                      var tg = window.Telegram?.WebApp;
                      if (tg) {
                        tg.ready();
                        tg.expand();
                        if (tg.requestFullscreen) tg.requestFullscreen();
                        if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
                        if (tg.setHeaderColor) tg.setHeaderColor("bg_color");
                      }
                    } catch (e) {}
                  `}
                </Script>
            </head>
            <body className={cx(inter.variable, "bg-background text-on-surface antialiased")}>
                <QueryProvider>
                    <RouteProvider>
                        <Theme>
                            <TelegramAutoAuth>
                                <NavProgress />
                                <AppHeader />
                                <main className="flex-1 flex flex-col mx-auto max-w-[800px] w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+112px)] pb-[100px]">
                                    {children}
                                </main>
                                <BottomNav />
                                <DevConsole />
                            </TelegramAutoAuth>
                        </Theme>
                    </RouteProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
