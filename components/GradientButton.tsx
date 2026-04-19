"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function GradientButton({ children, isLoading, className, ...props }: GradientButtonProps) {
  return (
    <motion.button
      whileHover={isLoading ? {} : { scale: 1.05 }}
      whileTap={isLoading ? {} : { scale: 0.95 }}
      disabled={isLoading || props.disabled}
      className={cn(
        "relative w-full rounded-full py-4 px-8 font-bold text-white overflow-hidden",
        "bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 border border-white/10",
        "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
        "transition-all duration-300",
        "hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]",
        "disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:shadow-none",
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
      {/* Shimmer effect placeholder */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />
    </motion.button>
  );
}
