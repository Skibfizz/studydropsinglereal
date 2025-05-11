import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyDrop Humanizer",
  description: "AI text humanizer tool",
  metadataBase: new URL('https://studydrop.io'),
  authors: [{ name: 'StudyDrop Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://studydrop.io',
    title: 'StudyDrop Humanizer',
    description: 'AI text humanizer tool',
    siteName: 'StudyDrop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyDrop Humanizer',
    description: 'AI text humanizer tool',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
