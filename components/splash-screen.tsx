"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface BibleVerse {
  text: string;
  reference: string;
}

const BIBLE_VERSES: BibleVerse[] = [
  {
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16",
  },
  {
    text: "Trust in the LORD with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5",
  },
  {
    text: "The LORD is my light and my salvation—whom shall I fear?",
    reference: "Psalm 27:1",
  },
  {
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28",
  },
  {
    text: "I can do all this through him who gives me strength.",
    reference: "Philippians 4:13",
  },
  {
    text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself.",
    reference: "Matthew 6:34",
  },
  {
    text: "Be still, and know that I am God.",
    reference: "Psalm 46:10",
  },
  {
    text: "Love the Lord your God with all your heart and with all your soul and with all your mind.",
    reference: "Matthew 22:37",
  },
  {
    text: "For we live by faith, not by sight.",
    reference: "2 Corinthians 5:7",
  },
  {
    text: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7",
  },
];

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVerse] = useState<BibleVerse>(() => {
    return BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = 2.5 + Math.random() * 1; // ~2.5% ±1% for natural feel
        if (prev + increment >= 100) {
          setIsLoading(false);
          clearInterval(interval);
          return 100;
        }
        return prev + increment;
      });
    }, 200); // update every 0.2s -> 5 updates/sec, ~7s total

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center px-4 overflow-hidden">
      <style>{`
        @keyframes rotateCross { 0% { transform: rotateZ(0deg); } 100% { transform: rotateZ(360deg); } }
        @keyframes pulseRing { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.2); opacity: 0.3; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatBounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-rotate-cross { animation: rotateCross 8s linear infinite; }
        .animate-pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
        .animate-fade-in-down { animation: fadeInDown 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-float-bounce { animation: floatBounce 3s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-24 h-24 animate-float-bounce">
              <div className="absolute inset-0 border-2 border-amber-100/30 rounded-full animate-pulse-ring" />
              <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-50 rounded-full opacity-20 blur-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-6xl text-amber-100 animate-rotate-cross"
                  style={{ transformOrigin: "center" }}
                >
                  ✝
                </div>
              </div>
            </div>

            <div className="text-center animate-fade-in-down">
              <h1 className="text-4xl font-light text-stone-50 tracking-wide mb-2">
                Baclaran Church
              </h1>
              <p className="text-sm text-stone-400 tracking-widest uppercase">
                Welcome to our community
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm animate-fade-in-up">
            <div className="bg-gradient-to-br from-amber-50/10 to-amber-100/5 backdrop-blur-sm border border-amber-100/20 rounded-lg p-6 space-y-4">
              <p className="text-sm text-amber-50/80 leading-relaxed italic">
                "{currentVerse.text}"
              </p>
              <div className="flex items-center justify-center">
                <p className="text-xs text-amber-100/60 tracking-wide uppercase font-medium">
                  — {currentVerse.reference}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-6">
            <div className="space-y-2">
              <Progress
                value={progress}
                className="h-2 bg-white rounded-full"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-stone-500 tracking-wide">
                  {Math.round(progress)}%
                </span>
                <span className="text-xs text-stone-500 tracking-wide">
                  {isLoading ? "Loading..." : "Welcome"}
                </span>
              </div>
            </div>

            <div className="text-center animate-fade-in-up">
              <p className="text-sm text-stone-400 leading-relaxed">
                Preparing your spiritual journey
              </p>
              <div className="flex justify-center gap-1 mt-3">
                <span className="w-1.5 h-1.5 bg-amber-100/60 rounded-full animate-bounce" />
                <span
                  className="w-1.5 h-1.5 bg-amber-100/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-amber-100/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-100/20 to-transparent animate-fade-in-up" />
        </div>
      </div>
    </div>
  );
}
