"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface BibleVerse {
  text: string;
  reference: string;
}

export function PageLoadingScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);

  // Fetch random Bible verse
  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const response = await fetch(
          "https://api.api-ninjas.com/v1/riddles?limit=1",
        );

        // Fallback verses if API fails
        const fallbackVerses: BibleVerse[] = [
          {
            text: "Trust in the Lord with all your heart and lean not on your own understanding.",
            reference: "Proverbs 3:5",
          },
          {
            text: "I can do all this through him who gives me strength.",
            reference: "Philippians 4:13",
          },
          {
            text: "For God so loved the world that he gave his one and only Son.",
            reference: "John 3:16",
          },
          {
            text: "The Lord is my light and my salvation whom shall I fear?",
            reference: "Psalm 27:1",
          },
          {
            text: "Be strong and courageous. Do not be afraid; do not be discouraged.",
            reference: "Joshua 1:9",
          },
          {
            text: "For I know the plans I have for you, declares the Lord.",
            reference: "Jeremiah 29:11",
          },
          {
            text: "Cast all your anxiety on him because he cares for you.",
            reference: "1 Peter 5:7",
          },
          {
            text: "The Lord is close to the brokenhearted.",
            reference: "Psalm 34:18",
          },
        ];

        const randomVerse =
          fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)];
        setVerse(randomVerse);
      } catch {
        // Use fallback verse
        const fallbackVerses: BibleVerse[] = [
          {
            text: "Trust in the Lord with all your heart and lean not on your own understanding.",
            reference: "Proverbs 3:5",
          },
          {
            text: "I can do all this through him who gives me strength.",
            reference: "Philippians 4:13",
          },
          {
            text: "For God so loved the world that he gave his one and only Son.",
            reference: "John 3:16",
          },
          {
            text: "The Lord is my light and my salvation whom shall I fear?",
            reference: "Psalm 27:1",
          },
          {
            text: "Be strong and courageous. Do not be afraid; do not be discouraged.",
            reference: "Joshua 1:9",
          },
          {
            text: "For I know the plans I have for you, declares the Lord.",
            reference: "Jeremiah 29:11",
          },
          {
            text: "Cast all your anxiety on him because he cares for you.",
            reference: "1 Peter 5:7",
          },
          {
            text: "The Lord is close to the brokenhearted.",
            reference: "Psalm 34:18",
          },
        ];

        const randomVerse =
          fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)];
        setVerse(randomVerse);
      } finally {
        setVerseLoading(false);
      }
    };

    if (isVisible) {
      fetchVerse();
    }
  }, [isVisible]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsVisible(true);
      setProgress(0);
      setVerseLoading(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 25;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-sm px-6 relative z-10">
        <div className="flex flex-col items-center gap-8">
          {/* Animated Cross Icon */}
          <div
            className="relative w-16 h-16 animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-50 rounded-full opacity-30 blur-xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl text-amber-100 drop-shadow-lg">✝</div>
            </div>

            {/* Rotating rings */}
            <div
              className="absolute inset-0 border-2 border-transparent border-t-amber-100 rounded-full animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <div
              className="absolute inset-1 border border-transparent border-t-amber-200 rounded-full animate-spin"
              style={{ animationDuration: "2s", animationDirection: "reverse" }}
            />
          </div>

          {/* Loading Message with animation */}
          <div className="text-center space-y-2 animate-fade-in">
            <h2 className="text-lg font-light text-stone-50 tracking-wide">
              Loading
            </h2>
            <p className="text-xs text-stone-400 tracking-widest uppercase">
              Please wait
            </p>
          </div>

          {/* Bible Verse Section */}
          <div
            className="w-full bg-stone-800/40 backdrop-blur-sm border border-amber-100/20 rounded-lg p-6 space-y-3 min-h-32 flex flex-col justify-center animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {verseLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-stone-700 rounded animate-pulse" />
                <div className="h-4 bg-stone-700 rounded animate-pulse w-5/6" />
                <div className="h-3 bg-stone-700 rounded animate-pulse w-1/3 mt-4" />
              </div>
            ) : verse ? (
              <>
                <p className="text-sm text-stone-100 leading-relaxed italic text-center">
                  "{verse.text}"
                </p>
                <p className="text-xs text-amber-200 font-medium text-center">
                  — {verse.reference}
                </p>
              </>
            ) : (
              <p className="text-xs text-stone-400 text-center">
                Loading verse...
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <Progress
              value={progress}
              className="h-1 bg-stone-800 rounded-full overflow-hidden"
            />
            <div className="text-center">
              <span className="text-xs text-stone-500">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Animated dots */}
          <div className="flex gap-2 justify-center">
            <div
              className="w-2 h-2 bg-amber-100 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="w-2 h-2 bg-amber-100 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 bg-amber-100 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
