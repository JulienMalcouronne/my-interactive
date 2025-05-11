import "./globals.css";
import React from "react";
import { generatePseudonym } from "@/lib/pseudonym";
import PseudonymDisplay from "@/components/PseudonymDisplay";
import MainNavbar from "@/components/MainNavbar";
import ScoreProvider from "@/components/ScoreProvider";
import ScoreHeader from "@/components/ScoreHeader";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const name = generatePseudonym()

  return (
    <html lang="en">
      <body>
        <main>
          <ScoreProvider>
            <div className="border-b z-[999] sticky top-0 left-0 right-0 bg-white bg-opacity-50 backdrop-blur-md">
              <MainNavbar />
              <div className="flex items-center gap-6">
                <PseudonymDisplay initialName={name} />
                <ScoreHeader />
              </div>
            </div>
            {children}
          </ScoreProvider>
        </main>
      </body>
    </html>
  );
}
