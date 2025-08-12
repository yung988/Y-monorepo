import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 py-5",
        "sm:px-8 sm:py-6",
        "md:px-12 md:py-8",
        "lg:px-16 lg:py-5",
        "xl:px-20",
        "2xl:px-24",
        "max-w-[1400px]", // Flexibilnější než fixní margin
        className,
      )}
    >
      {children}
    </div>
  );
}
