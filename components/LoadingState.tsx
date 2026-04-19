"use client";

import { motion } from "framer-motion";
import { InstagramIcon } from "./InstagramIcon";

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center py-8 space-y-6"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-t-2 border-r-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <InstagramIcon className="w-6 h-6 text-pink-500 animate-pulse" />
        </div>
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm font-medium text-purple-300 tracking-wide"
      >
        Mengambil preview profil Instagram publik...
      </motion.p>
    </motion.div>
  );
}
