import type { Metadata } from "next";
import { ShellNav } from "@/components/shell-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momento | NeoTechie Work OS",
  description: "Momento is NeoTechie's internal work operating system for projects, tasks, and productivity visibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-frame">
          <ShellNav />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
