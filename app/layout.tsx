import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { cookies } from "next/headers";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "AlphaEdge",
  description: "A mobile-first US stock decision app."
};

export const viewport: Viewport = {
  themeColor: "#070807",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;

  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${prompt.variable} font-sans antialiased bg-[#070807]`}>
        {token ? (
          <AppShell>{children}</AppShell>
        ) : (
          <div className="min-h-screen theme-dark text-zinc-100">
            {children}
          </div>
        )}
      </body>
    </html>
  );
}
