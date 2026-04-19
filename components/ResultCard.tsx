"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Clapperboard,
  ExternalLink,
  Grid2x2,
  Heart,
  Link2,
  MapPin,
  MessageCircle,
  Play,
  Tags,
} from "lucide-react";
import { RatingBar } from "./RatingBar";

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

interface ResultCardProps {
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

type ProfileTab = "posts" | "reels" | "tagged";

export function ResultCard({
  username,
  fullName,
  biography,
  avatarUrl,
  externalUrl,
  externalLinks,
  profileUrl,
  businessCategoryName,
  highlightReelCount,
  followers,
  following,
  posts,
  latestPosts,
  latestVideos,
  score,
  scoreBreakdown,
  source,
  statsAvailable,
  isPrivate,
  isVerified,
}: ResultCardProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const hasAutoScore = score != null && statsAvailable;
  const baseScore = score ?? 5;
  const [manualRating, setManualRating] = useState(baseScore);

  useEffect(() => {
    setManualRating(score ?? 5);
  }, [score]);

  const sourceLabel =
    source === "limited"
      ? "Preview terbatas"
      : source === "apify"
        ? "Profil live"
        : source === "public-api"
          ? "Preview publik"
          : "Preview HTML publik";

  const statItems = [
    { label: "Posts", value: posts ?? "-" },
    { label: "Followers", value: followers ?? "-" },
    { label: "Following", value: following ?? "-" },
    {
      label: "Highlights",
      value: highlightReelCount != null ? String(highlightReelCount) : String(externalLinks.length || 0),
    },
  ];

  const reelsItems = latestVideos.length > 0 ? latestVideos : latestPosts.filter(isVideoPost);
  const activeItems =
    activeTab === "posts" ? latestPosts : activeTab === "reels" ? reelsItems : [];
  const highlightItems = buildHighlightItems(highlightReelCount, externalLinks, latestPosts);
  const finalScore = Number(
    ((hasAutoScore ? (score + manualRating) / 2 : manualRating)).toFixed(1)
  );
  const finalAura = getAuraCopy(finalScore);
  const manualActive = Math.abs(manualRating - baseScore) >= 0.1;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="glass relative overflow-hidden rounded-[2rem] border border-white/8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
    >
      {latestPosts[0]?.displayUrl ? (
        <div className="absolute inset-x-0 top-0 h-72 overflow-hidden border-b border-white/5">
          <Image
            src={latestPosts[0].displayUrl}
            alt={`Preview profil ${username}`}
            fill
            sizes="100vw"
            unoptimized
            className="object-cover opacity-20 blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/10 via-black/65 to-black/95" />
        </div>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black uppercase tracking-[0.35em] text-zinc-200">Instagram View</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {sourceLabel}
            </span>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            {isPrivate ? "Private" : "Public"}
          </div>
        </div>

        <div className="space-y-8 px-5 py-6 sm:px-7 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
            <div className="space-y-5">
              <div className="mx-auto flex w-fit flex-col items-center lg:items-start">
                <div className="relative h-36 w-36 rounded-full p-[4px] bg-[conic-gradient(from_180deg,_#f472b6,_#8b5cf6,_#f97316,_#f472b6)] shadow-[0_0_45px_rgba(236,72,153,0.22)]">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-black">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={`Foto profil ${username}`}
                        fill
                        sizes="144px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-5xl font-black uppercase text-white/90">
                        {username.slice(0, 1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-black/30 p-5 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.28em] text-zinc-400">Aura Panel</span>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${getBadgeStyle(finalScore)}`}>
                    {finalAura.badge}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">{finalAura.description}</p>
                <RatingBar score={finalScore} />
                {hasAutoScore ? (
                  <>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                      <ScoreChip label="Profil" value={scoreBreakdown.profile} />
                      <ScoreChip label="Aktivitas" value={scoreBreakdown.activity} />
                      <ScoreChip label="Engagement" value={scoreBreakdown.engagement} />
                      <ScoreChip label="Konsistensi" value={scoreBreakdown.consistency} />
                    </div>
                  </>
                ) : (
                  <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/6 px-4 py-4 text-sm leading-relaxed text-zinc-300">
                    Data profil belum cukup lengkap untuk hitung aura otomatis. Anda masih bisa kasih rate manual di bawah.
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-zinc-400">
                        Rate manual
                      </p>
                      <p className="text-sm text-zinc-300">
                        Tambahkan penilaian manual kalau menurut Anda vibe profilnya lebih tinggi atau lebih rendah.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Manual</p>
                      <p className="text-xl font-black text-white">{manualRating.toFixed(1)}</p>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={manualRating}
                    onChange={(event) => {
                      setManualRating(Number(event.target.value));
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-fuchsia-500"
                  />

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                    <span>{hasAutoScore ? `Skor profil: ${baseScore.toFixed(1)}` : "Skor profil otomatis belum ada"}</span>
                    <span>Skor akhir: {finalScore.toFixed(1)}</span>
                  </div>

                  {hasAutoScore ? (
                    manualActive ? (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                        Skor akhir sekarang menggabungkan profil IG dan rate manual Anda secara rata-rata.
                      </p>
                    ) : (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                        Saat slider masih sama dengan skor profil, panel ini menampilkan hasil murni dari data IG.
                      </p>
                    )
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      Karena data otomatis belum lengkap, skor akhir saat ini sepenuhnya berasal dari rate manual Anda.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">@{username}</h2>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                        <BadgeCheck className="h-4 w-4" />
                        Verified
                      </span>
                    ) : null}
                    {businessCategoryName ? (
                      <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-zinc-300">
                        {businessCategoryName}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-xl font-bold text-white">{fullName}</p>
                    <p className="text-sm font-medium text-zinc-400">{source === "apify" ? "Live profile data" : "Public preview profile"}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(168,85,247,0.3)] transition hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka Profil IG
                  </a>
                  {externalUrl ? (
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-bold text-zinc-100 transition hover:bg-white/10"
                    >
                      <Link2 className="h-4 w-4" />
                      Link di Bio
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {statItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.35rem] border border-white/8 bg-white/5 px-4 py-4 text-left backdrop-blur-md"
                  >
                    <div className="text-2xl font-black text-white">{item.value}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-[1.6rem] border border-white/8 bg-black/25 p-5 backdrop-blur-xl">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-zinc-100 whitespace-pre-line">{biography || "Belum ada bio yang bisa ditampilkan."}</p>
                  {externalLinks.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {externalLinks.slice(0, 4).map((link) => (
                        <a
                          key={`${link.title}-${link.url}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:bg-white/10"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          <span>{link.title}</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.32em] text-zinc-400">Sorotan</p>
                <p className="text-sm text-zinc-500">Ring sorotan visual dibuat dari data profil dan media terbaru yang tersedia.</p>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {highlightItems.map((item) => (
                <div key={item.id} className="min-w-[84px] text-center">
                  <div className="mx-auto mb-2 h-20 w-20 rounded-full border border-white/10 bg-gradient-to-br from-white/12 to-white/4 p-[3px] shadow-[0_14px_28px_rgba(0,0,0,0.25)]">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-zinc-950">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="80px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#ec4899_0%,#8b5cf6_42%,#111827_100%)] text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
                          {item.title.slice(0, 1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="truncate text-xs font-semibold text-zinc-300">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/8 bg-black/30 p-4 sm:p-5">
            <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-white/6 pb-4">
              {[
                { id: "posts", label: "Posts", icon: Grid2x2 },
                { id: "reels", label: "Reels", icon: Clapperboard },
                { id: "tagged", label: "Tagged", icon: Tags },
              ].map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as ProfileTab)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                      selected
                        ? "border-white/15 bg-white text-black"
                        : "border-white/8 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "tagged" ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
                <Tags className="mb-4 h-10 w-10 text-zinc-500" />
                <p className="text-lg font-bold text-white">Belum ada preview tagged post</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
                  Provider saat ini belum mengirim daftar post yang menandai akun ini, jadi tab tagged masih tampil sebagai placeholder visual.
                </p>
              </div>
            ) : activeItems.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeItems.map((post, index) => (
                  <motion.a
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.4 }}
                    className="group overflow-hidden rounded-[1.4rem] border border-white/8 bg-white/[0.03]"
                  >
                    <div className="relative aspect-square overflow-hidden bg-zinc-950">
                      {post.displayUrl ? (
                        <Image
                          src={post.displayUrl}
                          alt={post.caption || `Post ${post.shortCode || post.id}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ec4899_0%,#8b5cf6_36%,#111827_100%)]" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90" />

                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <span className="rounded-full border border-white/15 bg-black/45 px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">
                          {labelForPost(post)}
                        </span>
                        {isVideoPost(post) ? (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white">
                            <Play className="h-4 w-4 fill-current" />
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="mb-3 flex items-center gap-3 text-xs font-semibold text-white/90">
                          <span className="inline-flex items-center gap-1.5">
                            <Heart className="h-3.5 w-3.5" />
                            {formatMetric(post.likesCount)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {formatMetric(post.commentsCount)}
                          </span>
                          {post.locationName ? (
                            <span className="inline-flex items-center gap-1.5 truncate">
                              <MapPin className="h-3.5 w-3.5" />
                              {post.locationName}
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-sm font-bold text-white">
                          {post.caption || "Buka postingan di Instagram"}
                        </p>
                        <p className="mt-1 text-xs text-zinc-300">{formatDate(post.timestamp)}</p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
                <Grid2x2 className="mb-4 h-10 w-10 text-zinc-500" />
                <p className="text-lg font-bold text-white">Belum ada media untuk ditampilkan</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
                  Provider berhasil memberi profil, tetapi daftar postingan detail belum tersedia untuk tab ini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function getBadgeStyle(score: number | null) {
  if (score != null && score >= 9) {
    return "border-pink-500/30 bg-pink-500/10 text-pink-300";
  }

  if (score != null && score >= 7) {
    return "border-violet-500/30 bg-violet-500/10 text-violet-200";
  }

  if (score != null && score >= 5) {
    return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  }

  return "border-white/10 bg-white/5 text-zinc-300";
}

function getAuraCopy(score: number) {
  if (score >= 9) {
    return {
      badge: "STARBOY",
      description: "Aura selebgram 100%. Presence kuat, profil rapi, dan engagement-nya kelihatan hidup.",
    };
  }

  if (score >= 8) {
    return {
      badge: "AESTHETIC GOD",
      description: "Profil kuat, visual konsisten, dan kesan personal brand-nya dapet banget.",
    };
  }

  if (score >= 6) {
    return {
      badge: "HUSTLER",
      description: "Akun rapi, aktif, dan masih punya aura yang solid. Cocok buat personal brand yang terus tumbuh.",
    };
  }

  if (score >= 4) {
    return {
      badge: "NPC TIER",
      description: "Profilnya sudah jalan, tapi vibe, konsistensi, dan daya tarik kontennya masih bisa dinaikkan.",
    };
  }

  return {
    badge: "MYSTERIOUS",
    description: "Low profile banget. Identitas profilnya masih tipis, jadi aura-nya belum kebentuk penuh.",
  };
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/25 px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value.toFixed(1)}</p>
    </div>
  );
}

function buildHighlightItems(
  highlightReelCount: number | null,
  externalLinks: ProfileExternalLink[],
  latestPosts: ProfilePost[]
) {
  const covers = latestPosts.map((post) => post.displayUrl).filter((item): item is string => Boolean(item));
  const desiredCount = Math.max(
    Math.min(highlightReelCount ?? externalLinks.length ?? 4, 6),
    4
  );
  const items = [] as { id: string; title: string; image: string | null }[];

  for (let index = 0; index < desiredCount; index += 1) {
    const link = externalLinks[index];
    items.push({
      id: `highlight-${index}`,
      title: link?.title || `Story ${index + 1}`,
      image: covers[index % (covers.length || 1)] ?? null,
    });
  }

  return items;
}

function isVideoPost(post: ProfilePost) {
  const type = post.type?.toLowerCase() ?? "";
  const productType = post.productType?.toLowerCase() ?? "";

  return type === "video" || productType.includes("clip") || productType.includes("igtv");
}

function labelForPost(post: ProfilePost) {
  if (post.productType?.toLowerCase().includes("clip")) {
    return "Reel";
  }

  if (post.type?.toLowerCase() === "video") {
    return "Video";
  }

  return "Post";
}

function formatMetric(value: number | null) {
  if (value == null) {
    return "-";
  }

  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Tanggal tidak tersedia";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(parsed);
}
