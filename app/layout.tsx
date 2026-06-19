import "./globals.css";
import Navbar from "./navbar";
import { Outfit, Inter } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "TaskFlow | Smart Student Task Manager",
  description: "Manage, track, and master your student workflow with an interactive experience built on Next.js and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="bg-background text-foreground antialiased selection:bg-violet-500/30 selection:text-violet-200">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {children}
          </main>

          <footer className="border-t border-zinc-800/40 bg-zinc-950/60 backdrop-blur-sm py-8 text-center text-sm text-zinc-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>
                &copy; {new Date().getFullYear()} TaskFlow. Crafted for high productivity.
              </p>
              <p className="flex items-center gap-1.5 text-zinc-400">
                <span>Designed & Built by</span>
                <span className="font-semibold text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text">
                  Ameen Ali
                </span>
                <span>🚀</span>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}