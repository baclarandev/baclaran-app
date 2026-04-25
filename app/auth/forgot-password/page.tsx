"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return toast.error("Please enter your email");

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success(
          "If this email exists, a password reset link has been sent!",
        );
        setEmail("");
      } else {
        toast.error("Something went wrong. Try again later.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-stone-900 to-stone-950 px-4">
      {/* Logo / Branding */}
      <div className="mb-12 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
          <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center">
          Reset Your Password
        </h1>
        <p className="text-stone-400 mt-1 text-center max-w-sm">
          Enter your email below and we’ll send you a link to reset your
          password.
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-stone-800/60 backdrop-blur-md rounded-xl shadow-lg p-8">
        <div className="space-y-5">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-stone-700/50 border-stone-600 text-white placeholder:text-stone-400 h-12"
          />

          <Button
            onClick={handleSubmit}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <p className="text-sm text-stone-400 text-center">
            We’ll send a password reset link if your email exists in our system.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-stone-500 text-xs mt-8 text-center">
        © National Shrine of Our Mother of Perpetual Help. All rights reserved.
      </p>
    </div>
  );
}
