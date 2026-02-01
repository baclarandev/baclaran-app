"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--success-bg": "#D1FAE5", // green
          "--success-text": "#065F46",
          "--error-bg": "#FEE2E2", // red
          "--error-text": "#991B1B",
          "--warning-bg": "#FEF3C7", // yellow
          "--warning-text": "#78350F",
          "--info-bg": "#DBEAFE", // blue
          "--info-text": "#1E40AF",
          "--loading-bg": "#E5E7EB", // gray
          "--loading-text": "#374151",
          "--border-radius": "0.5rem",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
