"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Church,
  Eye,
  EyeOff,
  Loader2,
  Compass,
  Users,
  Heart,
} from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/app/services/login";
import { useRouter } from "next/navigation";
import SplashScreen from "@/components/splash-screen";
import { toast } from "sonner";
import { Spotlight } from "@/components/ui/spotlight-new";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import ContactSupportModal from "./_component/contact-support";
const Page = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 6000); // splash shows 6s
    return () => clearTimeout(timer);
  }, []);
  const staffLoginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: (data) => {
      const email = data?.user?.email;

      toast.success(email ? `Welcome back, ${email}! 🙏` : "Welcome back! 🙏");

      setTimeout(() => router.push("/dashboard"), 800);
    },

    onError: async (error: any) => {
      const message = error?.message || "Invalid email or password";

      toast.error(message);
    },
  });

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    staffLoginMutation.mutate({ email, password });
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    fetch("/api/auth/me").then((res) => {
      if (res.ok) router.replace("/dashboard");
    });
  }, []);

  if (showSplash)
    return <SplashScreen onComplete={() => setShowSplash(false)} />;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center px-4 py-12 text-white">
      <BackgroundBeams />
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left side - Content */}
        <div className="hidden md:flex flex-col space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-light leading-tight">
              Welcome to{" "}
              <span className="font-semibold text-blue-300">
                National Shrine of Our Mother of Perpetual Help Volunteer
                Management System
              </span>{" "}
            </h1>
            <p className="text-lg text-stone-300 leading-relaxed">
              A sacred space where our community gathers to grow spiritually,
              serve faithfully, and care for one another with compassion and
              purpose.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Compass className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Spiritual Guidance
                </h3>
                <p className="text-stone-400 text-sm">
                  Access resources and community support for your faith journey
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Community Connection
                </h3>
                <p className="text-stone-400 text-sm">
                  Stay informed and collaborate with fellow staff members
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Heart className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Serve with Purpose
                </h3>
                <p className="text-stone-400 text-sm">
                  Manage ministry activities and outreach initiatives
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full">
          <Card className="border-neutral-600/30 bg-blue-500/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16  rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Image
                  src={Logo}
                  alt="Baclaran Church Logo"
                  width={52}
                  height={52}
                />
              </div>
              <CardTitle className="text-3xl font-light text-white">
                Login to Your Account
              </CardTitle>
              <CardDescription className="text-stone-300 mt-2">
                Access your account to manage parish operations
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleStaffSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@baclaran.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-gray-800/50 border-neutral-600/30 text-amber-100 placeholder:text-stone-500"
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="password" className="text-white font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10 bg-gray-800/50 border-neutral-600/30 text-amber-100 placeholder:text-stone-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-11 -translate-y-1/2 text-stone-400 hover:text-blue-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={staffLoginMutation.isPending}
                  className="w-full h-11 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  {staffLoginMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <p className="text-sm  text-center mt-2">
                  <a
                    href="/auth/forgot-password"
                    className="text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </a>
                </p>
                <div className="pt-4 border-t border-neutral-600/30">
                  <p className="text-center text-stone-400 text-sm mb-3">
                    Need help accessing your account?
                  </p>
                  <ContactSupportModal />
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-stone-500 text-xs mt-6">
            © National Shrine of Our Mother of Perpetual Help. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
