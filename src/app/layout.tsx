import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import Script from "next/script";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { QueryProvider } from "@/providers/query-provider";
import { TelegramAutoAuth } from "@/providers/telegram-auto-auth";
import { SplashProvider } from "@/providers/splash-provider";
import { NavProgress } from "@/components/elevo/layout/nav-progress";
import { AppHeader } from "@/components/elevo/layout/app-header";
import { BottomNav } from "@/components/elevo/layout/bottom-nav";
import { DevConsole } from "@/components/dev/dev-console";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";

const lexend = Lexend({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-lexend",
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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Theme FOUC prevention — runs before first paint */}
                <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("elevo-theme")||((window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches)?"dark":"light");document.documentElement.classList.add(t==="dark"?"dark-mode":"light-mode")}catch(e){document.documentElement.classList.add("dark-mode")}` }} />
                {/* Telegram SDK — beforeInteractive so fullscreen works before splash */}
                <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
                <Script id="tg-init" strategy="beforeInteractive">{`try{var tg=window.Telegram?.WebApp;if(tg){tg.ready();tg.expand();if(tg.requestFullscreen)tg.requestFullscreen();if(tg.disableVerticalSwipes)tg.disableVerticalSwipes();if(tg.setHeaderColor)tg.setHeaderColor("bg_color")}}catch(e){}`}</Script>
            </head>
            <body className={cx(lexend.variable, "bg-background text-on-surface antialiased")}>
                <SplashProvider>
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
                </SplashProvider>
            </body>
        </html>
    );
}
