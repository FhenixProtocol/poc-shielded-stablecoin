import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Shielded Stablecoin",
  description: "Confidential stablecoin built with FHE and COFHE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="fhenix">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
