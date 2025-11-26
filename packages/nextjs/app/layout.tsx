import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
