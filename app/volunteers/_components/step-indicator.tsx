"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { steps } from "@/app/types/volunteer";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mt-4 flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                currentStep > step.id
                  ? "bg-green-600 border-green-600 text-white"
                  : currentStep === step.id
                    ? "bg-yellow-500 border-yellow-500 text-gray-900"
                    : "bg-gray-700 border-gray-600 text-gray-400",
              )}
            >
              {currentStep > step.id ? (
                <Check className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            <span
              className={cn(
                "text-xs mt-2 font-medium",
                currentStep >= step.id ? "text-gray-100" : "text-gray-500",
              )}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-2 mb-6",
                currentStep > step.id ? "bg-green-600" : "bg-gray-600",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
