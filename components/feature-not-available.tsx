"use client";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sidebar } from "./layout/sidebar";
import { Header } from "./layout/header";

const FeatureNotAvailable = () => {
  return (
    <>
      <div className="flex min-h-screen text-white items-center justify-center bg-gray-900 px-6">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-warning/10 mb-6"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            >
              <Construction
                className="w-12 h-12 text-warning"
                strokeWidth={1.5}
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-3xl font-semibold text-foreground mb-3">
              Feature not available
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              This feature is currently under development or not available in
              your plan. Check back soon or contact support for more
              information.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default" size="lg">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go home
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go back
              </Button>
            </div>
          </motion.div>

          <motion.p
            className="mt-12 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Need help?{" "}
            <a
              href="mailto:support@example.com"
              className="text-primary hover:underline"
            >
              Contact support
            </a>
          </motion.p>
        </div>
      </div>
    </>
  );
};

export default FeatureNotAvailable;
