"use client";

import { motion } from "framer-motion";

export function RatingBar({ score }: { score: number }) {
  const percentage = (score / 10) * 100;
  
  const getGradient = () => {
    if (score >= 8) return "from-emerald-400 to-cyan-400";
    if (score >= 5) return "from-yellow-400 to-orange-400";
    return "from-rose-400 to-red-500";
  };

  const getShadow = () => {
    if (score >= 8) return "shadow-[0_0_15px_rgba(52,211,153,0.5)]";
    if (score >= 5) return "shadow-[0_0_15px_rgba(250,204,21,0.5)]";
    return "shadow-[0_0_15px_rgba(244,63,94,0.5)]";
  }

  return (
    <div className="w-full mt-8">
      <div className="flex justify-between items-end mb-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Aura Score
        </span>
        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 drop-shadow-lg">
          {score.toFixed(1)} <span className="text-lg text-zinc-600">/ 10</span>
        </span>
      </div>
      <div className="h-4 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden p-[2px] shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} ${getShadow()}`}
        />
      </div>
    </div>
  );
}
