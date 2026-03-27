import type { Metadata } from "next";
import { ShellNav } from "@/components/shell-nav";
import "./globals.css";

const themeScript = `
  (() => {
    const saved = window.localStorage.getItem("momento-theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = saved === "dark" || saved === "light" ? saved : systemTheme;
    document.documentElement.dataset.theme = theme;
  })();
`;

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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="app-frame">
          <ShellNav />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
