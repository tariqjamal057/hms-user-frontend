// components/consultation/consultation-stepper.tsx
"use client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type ConsultationStep = {
  num: number;
  label: string;
  desc: string;
};

export type ConsultationProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

export function ConsultationProgressBar({
  currentStep,
  totalSteps,
  className = "",
}: ConsultationProgressBarProps) {
  const progress = totalSteps === 0 ? 0 : (currentStep / totalSteps) * 100;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
        initial={false}
        animate={{ width: `${Math.max(progress, 0)}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
      />
    </div>
  );
}

export type ConsultationStepperProps = {
  steps: ConsultationStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
};

export function ConsultationStepper({
  steps,
  currentStep,
  onStepClick,
}: ConsultationStepperProps) {
  const total = steps.length;
  const progress = total === 0 ? 0 : (currentStep / total) * 100;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between overflow-x-auto">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center min-w-[145px]">
              <button
                type="button"
                onClick={() => onStepClick?.(step.num)}
                className={`flex flex-col items-start transition-colors ${
                  currentStep >= step.num ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep > step.num
                      ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.num
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-slate-300 text-slate-400 bg-white"
                  }`}
                >
                  {currentStep > step.num
                    ? <CheckCircle className="w-5 h-5" />
                    : step.num}
                </div>
                <span className="mt-2 text-xs font-semibold">{step.label}</span>
                <span className="text-[10px] text-slate-400">{step.desc}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className="h-px flex-1 bg-slate-200 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Animated progress bar */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
              initial={false}
              animate={{ width: `${Math.max(progress, 0)}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-sm font-bold text-blue-700">
            {Math.round(progress)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}