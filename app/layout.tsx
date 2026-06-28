import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "AlphaEdge",
  description: "A mobile-first US stock decision app.",
  applicationName: "AlphaEdge",
  appleWebApp: {
    capable: true,
    title: "AlphaEdge",
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: "#070807",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${prompt.variable} font-sans antialiased bg-[#070807]`}>
        {user ? (
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
