"use client";

import { Button } from "@/components/ui/button";

interface DialogActionsProps {
  currentStep: number;
  totalSteps: number;
  isLoading?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function DialogActions({
  currentStep,
  totalSteps,
  isLoading = false,
  onBack,
  onNext,
  onSubmit,
}: DialogActionsProps) {
  return (
    <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-600">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1 || isLoading}
        className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
      >
        Back
      </Button>

      {currentStep < totalSteps ? (
        <Button
          onClick={onNext}
          disabled={isLoading}
          className="bg-yellow-500 text-gray-900 hover:bg-yellow-600"
        >
          Next
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          {isLoading ? "Saving..." : "Submit"}
        </Button>
      )}
    </div>
  );
}
