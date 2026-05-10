"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InputField } from "@/components/InputField";
import { GradientButton } from "@/components/GradientButton";
import { LoadingState } from "@/components/LoadingState";
import { ResultCard } from "@/components/ResultCard";
import { cn } from "@/lib/utils";

interface ProfileExternalLink {
  title: string;
  url: string;
  type: string | null;
}

interface ProfilePost {
  id: string;
  shortCode: string | null;
  caption: string | null;
  displayUrl: string | null;
  url: string;
  likesCount: number | null;
  commentsCount: number | null;
  timestamp: string | null;
  type: string | null;
  productType: string | null;
  locationName: string | null;
}

interface ScoreBreakdown {
  profile: number;
  activity: number;
  engagement: number;
  consistency: number;
}

interface ResultData {
  username: string;
  fullName: string;
  biography: string | null;
  avatarUrl: string | null;
  externalUrl: string | null;
  externalLinks: ProfileExternalLink[];
  profileUrl: string;
  businessCategoryName: string | null;
  highlightReelCount: number | null;
  followers: string | null;
  following: string | null;
  posts: string | null;
  latestPosts: ProfilePost[];
  latestVideos: ProfilePost[];
  score: number | null;
  scoreBreakdown: ScoreBreakdown;
  badge: string;
  description: string;
  source: "apify" | "public-html" | "public-api" | "limited";
  statsAvailable: boolean;
  isPrivate: boolean | null;
  isVerified: boolean | null;
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username gak boleh kosong dong, cantumkan siapapun!");
      return;
    }
    
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/analyze?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Profil Instagram tidak bisa ditemukan.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat mengambil profil Instagram.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [result]);

  return (
    <main
      className={cn(
        "min-h-screen relative flex flex-col items-center p-4 sm:p-8 overflow-hidden",
        result ? "justify-start py-8 sm:py-12" : "justify-center"
      )}
    >
      {/* Background radial effects */}
      <div className="fixed top-0 left-0 w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none float-animation" />
      <div className="fixed bottom-0 right-0 w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none float-animation" style={{ animationDelay: '3s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-pink-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Subtle noise texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div
        className={cn(
          "z-10 w-full mx-auto relative",
          result ? "max-w-6xl space-y-8" : "max-w-lg space-y-10"
        )}
      >
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-4"
        >
          <div className="inline-block mb-2 px-3 py-1 rounded-full glass border-white/10 text-xs font-medium tracking-wide text-zinc-300">
            ✨ Cek profile IG siapapun
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight">
            <span className="text-gradient drop-shadow-lg">Rate IG</span> 🔥
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg font-medium tracking-wide max-w-md mx-auto leading-relaxed">
            Cari profil Instagram publik dan tampilkan preview-nya langsung tanpa login
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-8 sm:p-10 shadow-2xl relative w-full border-t border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent rounded-3xl pointer-events-none" />
          <form onSubmit={handleAnalyze} className="space-y-6 flex flex-col items-center relative z-10 w-full group">
            <InputField 
              placeholder="Username Instagram (tanpa @)"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              error={error}
            />
            
            <GradientButton type="submit" isLoading={isLoading}>
              {isLoading ? "Mengambil profil..." : "Tampilkan Profil IG"}
            </GradientButton>
          </form>
        </motion.div>

        {/* Loading & Result */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div key="loading">
              <LoadingState />
            </motion.div>
          )}

          {result && !isLoading && (
            <motion.div 
              key="result"
              ref={resultRef}
              className="pt-2 pb-10"
            >
              <ResultCard 
                username={result.username}
                fullName={result.fullName}
                biography={result.biography}
                avatarUrl={result.avatarUrl}
                externalUrl={result.externalUrl}
                externalLinks={result.externalLinks}
                profileUrl={result.profileUrl}
                businessCategoryName={result.businessCategoryName}
                highlightReelCount={result.highlightReelCount}
                followers={result.followers}
                following={result.following}
                posts={result.posts}
                latestPosts={result.latestPosts}
                latestVideos={result.latestVideos}
                score={result.score}
                scoreBreakdown={result.scoreBreakdown}
                badge={result.badge}
                description={result.description}
                source={result.source}
                statsAvailable={result.statsAvailable}
                isPrivate={result.isPrivate}
                isVerified={result.isVerified}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </main>
  );
}
