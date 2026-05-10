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
      whileHover={isLoading ? {} : { scale: 1.02 }}
      whileTap={isLoading ? {} : { scale: 0.98 }}
      disabled={isLoading || props.disabled}
      className={cn(
        "group relative w-full rounded-2xl py-4 px-8 font-bold text-white overflow-hidden tracking-wide",
        "bg-zinc-900 border border-white/10",
        "transition-all duration-300",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Inner glow/shadow */}
      <div className="absolute inset-0 shadow-[inset_0_1px_rgba(255,255,255,0.4)] pointer-events-none rounded-2xl" />

      <div className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </div>
      
      {/* Glare effect sweeping across */}
      {!isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
      )}
    </motion.button>
  );
}
