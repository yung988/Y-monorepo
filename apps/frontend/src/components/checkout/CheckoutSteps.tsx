"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  name: string;
  description: string;
}

const steps: Step[] = [
  { id: "cart", name: "Košík", description: "Kontrola položek" },
  { id: "delivery", name: "Doprava", description: "Způsob doručení" },
  { id: "billing", name: "Fakturační údaje", description: "Kontaktní informace" },
  { id: "payment", name: "Platba", description: "Platební údaje" },
];

interface CheckoutStepsProps {
  currentStep: string;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step.id} className="md:flex-1">
            <div
              className={cn(
                "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                index <= currentStepIndex ? "border-zinc-900" : "border-zinc-200",
              )}
            >
              <span className="text-sm font-medium">
                <span
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm",
                    index < currentStepIndex
                      ? "bg-zinc-900 text-white"
                      : index === currentStepIndex
                        ? "border-2 border-zinc-900 bg-white text-zinc-900"
                        : "border-2 border-zinc-300 bg-white text-zinc-500",
                  )}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <span
                  className={cn(
                    "ml-2",
                    index <= currentStepIndex ? "text-zinc-900" : "text-zinc-500",
                  )}
                >
                  {step.name}
                </span>
              </span>
              <span
                className={cn(
                  "text-sm",
                  index <= currentStepIndex ? "text-zinc-600" : "text-zinc-400",
                )}
              >
                {step.description}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
