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
import { Church, Eye, EyeOff, Loader2 } from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/app/services/login";
import { useRouter } from "next/navigation";
import SplashScreen from "@/components/splash-screen";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const staffLoginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: (data) => {
      toast("Welcome!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast("Login Failed");
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

  if (isLoading) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center px-4 text-white">
      <Card className="border-amber-600/30 bg-stone-900/80 backdrop-blur-md shadow-2xl w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-amber-400/20 rounded-3xl flex items-center justify-center shadow-lg mb-4 animate-pulse">
            <Church className="w-10 h-10 text-amber-200" />
          </div>
          <CardTitle className="text-2xl font-light text-amber-200">
            Baclaran Church
          </CardTitle>
          <CardDescription className="text-stone-400">
            Staff Login
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleStaffSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-amber-200">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-stone-800 border-amber-600/30 text-amber-100"
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-amber-200">
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 pr-10 bg-stone-800 border-amber-600/30 text-amber-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-300"
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
              className="w-full h-11 bg-amber-400 text-stone-900 font-semibold hover:bg-amber-500"
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
            <div className="text-center">
              <p>Want to be a volunteer? </p>
              <Button variant="link" className="cursor-pointer underline">
                Apply here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
