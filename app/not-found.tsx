"use client";

import Link from "next/link";
import { Home, ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center px-4 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>

      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center gap-12 text-center">
          {/* 404 Number with Cross */}
          <div className="relative animate-float">
            {/* Decorative ring */}

            {/* Main 404 display */}
            <div className="relative space-y-4">
              <div className="text-9xl font-light text-amber-100/30 tracking-tight">
                {` 4            `} {`  0  `} 4
              </div>
            </div>
          </div>

          {/* Message Section */}
          <div
            className="space-y-6 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-light text-stone-50 mb-3 tracking-wide">
                Page Not Found
              </h1>
              <p className="text-sm md:text-base text-stone-400 leading-relaxed max-w-lg mx-auto">
                The page you're looking for has wandered off the path. Let's
                guide you back to the right direction.
              </p>
            </div>

            {/* Decorative line */}
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-100/40 to-transparent mx-auto" />

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/">
                <Button className="flex items-center gap-2 bg-amber-100 text-stone-900 hover:bg-amber-200 hover:shadow-lg hover:shadow-amber-100/20 px-6 py-2 h-11">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-6 py-2 h-11 border border-amber-100/30 text-amber-100 hover:bg-amber-100/10 rounded-md transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>

          {/* Spiritual message */}
          <div
            className="mt-8 p-6 bg-amber-100/5 border border-amber-100/20 rounded-lg backdrop-blur-sm animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-amber-100/60" />
              <p className="text-xs text-amber-100/60 uppercase tracking-widest">
                Inspiration
              </p>
              <Heart className="w-4 h-4 text-amber-100/60" />
            </div>
            <p className="text-sm text-stone-300 italic leading-relaxed">
              "Trust in the LORD with all your heart and lean not on your own
              understanding." — Proverbs 3:5
            </p>
          </div>

          {/* Ambient particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-20 left-10 w-1 h-1 bg-amber-200 rounded-full opacity-30 animate-pulse"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="absolute top-40 right-20 w-1 h-1 bg-amber-100 rounded-full opacity-20 animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute bottom-40 left-1/4 w-0.5 h-0.5 bg-amber-200/50 rounded-full opacity-25 animate-pulse"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute bottom-20 right-1/3 w-1 h-1 bg-amber-100/40 rounded-full opacity-20 animate-pulse"
              style={{ animationDelay: "1.5s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
