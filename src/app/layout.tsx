import "./globals.css";
import React from "react";
import { generatePseudonym } from "@/lib/pseudonym";
import PseudonymDisplay from "@/components/global/PseudonymDisplay";
import MainNavbar from "@/components/global/MainNavbar";
import ScoreProvider from "@/components/global/ScoreProvider";
import ScoreHeader from "@/components/global/ScoreHeader";
import Footer from "@/components/global/footer/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const name = generatePseudonym();

  return (
    <html lang="en">
      <body>
        <main>
          <ScoreProvider>
            <div className="border-b z-[999] sticky top-0 left-0 right-0 bg-white bg-opacity-50 backdrop-blur-md">
              <MainNavbar />
              <div className="flex items-center gap-6 no-print">
                <PseudonymDisplay initialName={name} />
                <ScoreHeader />
              </div>
            </div>
            {children}
            <Footer />
          </ScoreProvider>
        </main>
      </body>
    </html>
  );
}
