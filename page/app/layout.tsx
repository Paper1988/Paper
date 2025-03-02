import "@/style/globals.css";
import { StyledEngineProvider } from "@mui/material";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Paper - Dashboard",
	description: "A dashboard for Paper📄 bot on Discord",
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-TW" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<StyledEngineProvider>
					<Providers>{children}</Providers>
				</StyledEngineProvider>
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
