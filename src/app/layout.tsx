'use client'

import "./globals.css";
import React, { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();
  const [score, setScore] = useState(20);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);

  const intervalRef = useRef(scoreMultiplier);

  const MAX_MULTIPLIER = 5;


  useEffect(() => {
    intervalRef.current = scoreMultiplier;
  }, [scoreMultiplier]);


  useEffect(() => {
    const interval = setInterval(() => {

      setScore(prev => prev + intervalRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setScore(prev => prev + (5 * scoreMultiplier));

  }, [pathname]);

  const handleClick = () => {

    setScoreMultiplier(prev => (prev < MAX_MULTIPLIER ? prev + 1 : prev));
  };




  return (
    <html lang="en">
      <body
      >
        <main>
          <div className="border-b z-[999] sticky top-0 left-0 right-0 bg-white bg-opacity-50 backdrop-blur-md">
            <nav className=" gap-4 p-4 bg-black">
              <ul className="flex gap-4">
                <li>
                  <Link href={'/'}>Home</Link>
                </li>
                <li>
                  <Link href={'airplane'}>Airplane</Link>
                </li>

                <li className="flex-1 text-right">
                  <Link href={'leaderboard'}>Leaderboard</Link>
                </li>
              </ul>
            </nav>
            <span className="p-5">Current score: {score}</span>
            <button
              onClick={handleClick}
              disabled={scoreMultiplier >= MAX_MULTIPLIER}
              className={[
                "select-none p-2 ml-4",
                scoreMultiplier >= MAX_MULTIPLIER
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-gray-100"
              ].join(" ")}
            >
              Score multiplier: {scoreMultiplier}
            </button>
          </div>

          {children}
        </main>
      </body>
    </html >
  );
}
