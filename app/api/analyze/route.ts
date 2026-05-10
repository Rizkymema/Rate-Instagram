import { NextResponse } from "next/server";

const INSTAGRAM_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
const INSTAGRAM_APP_ID = "936619743392459";
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_INSTAGRAM_PROFILE_ACTOR =
  process.env.APIFY_INSTAGRAM_PROFILE_ACTOR ?? "apify~instagram-profile-scraper";

type ProfileSource = "apify" | "public-html" | "public-api" | "embed-html" | "limited";

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

interface ProfileSeed {
  username: string;
  fullName?: string | null;
  biography?: string | null;
  avatarUrl?: string | null;
  externalUrl?: string | null;
  externalLinks?: ProfileExternalLink[] | null;
  businessCategoryName?: string | null;
  highlightReelCount?: number | null;
  followersCount?: number | null;
  followingCount?: number | null;
  postsCount?: number | null;
  latestPosts?: ProfilePost[] | null;
  latestVideos?: ProfilePost[] | null;
  isPrivate?: boolean | null;
  isVerified?: boolean | null;
}

interface ScoreBreakdown {
  profile: number;
  activity: number;
  engagement: number;
  consistency: number;
}

interface FetchResult {
  status: "ok" | "not-found" | "unavailable";
  seed?: ProfileSeed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = sanitizeUsername(searchParams.get("username"));

  if (!username) {
    return NextResponse.json(
      { error: "Username Instagram wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const apifyResult = await fetchProfileFromApify(username);
    if (apifyResult.status === "not-found") {
      return NextResponse.json(
        { error: "Username Instagram tidak ditemukan." },
        { status: 404 }
      );
    }

    if (apifyResult.status === "ok" && apifyResult.seed) {
      return NextResponse.json(buildResponse(apifyResult.seed, "apify"));
    }

    const htmlResult = await fetchProfileFromHtml(username);
    if (htmlResult.status === "not-found") {
      return NextResponse.json(
        { error: "Username Instagram tidak ditemukan." },
        { status: 404 }
      );
    }

    if (htmlResult.status === "ok" && htmlResult.seed) {
      return NextResponse.json(buildResponse(htmlResult.seed, "public-html"));
    }

    const apiResult = await fetchProfileFromApi(username);
    if (apiResult.status === "not-found") {
      return NextResponse.json(
        { error: "Username Instagram tidak ditemukan." },
        { status: 404 }
      );
    }

    if (apiResult.status === "ok" && apiResult.seed) {
      return NextResponse.json(buildResponse(apiResult.seed, "public-api"));
    }

    const embedResult = await fetchProfileFromEmbed(username);
    if (embedResult.status === "not-found") {
      return NextResponse.json(
        { error: "Username Instagram tidak ditemukan." },
        { status: 404 }
      );
    }

    if (embedResult.status === "ok" && embedResult.seed) {
      return NextResponse.json(buildResponse(embedResult.seed, "embed-html"));
    }

    return NextResponse.json(buildResponse({ username }, "limited"));
  } catch (error) {
    console.error("Instagram preview fetch failed", error);
    return NextResponse.json(buildResponse({ username }, "limited"));
  }
}

async function fetchProfileFromApify(username: string): Promise<FetchResult> {
  if (!APIFY_TOKEN) {
    return { status: "unavailable" };
  }

  const response = await fetch(
    `https://api.apify.com/v2/acts/${APIFY_INSTAGRAM_PROFILE_ACTOR}/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_TOKEN)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernames: [username],
      }),
      next: { revalidate: 300 },
    }
  );

  if (response.status === 404) {
    return { status: "not-found" };
  }

  if (!response.ok) {
    return { status: "unavailable" };
  }

  const items = (await response.json()) as ApifyProfileItem[];
  if (!Array.isArray(items) || items.length === 0) {
    return { status: "not-found" };
  }

  const normalizedUsername = normalizeUsername(username);
  const item =
    items.find((candidate) => normalizeUsername(candidate.username) === normalizedUsername) ??
    items[0];

  if (!item) {
    return { status: "unavailable" };
  }

  return {
    status: "ok",
    seed: {
      username,
      fullName: item.fullName ?? item.full_name ?? item.username ?? username,
      biography: item.biography ?? item.bio ?? null,
      avatarUrl:
        item.profilePicUrlHD ??
        item.profilePicUrl ??
        item.profile_pic_url_hd ??
        item.profile_pic_url ??
        null,
      externalUrl: item.externalUrl ?? item.external_url ?? item.website ?? null,
      externalLinks: normalizeExternalLinksFromApify(item.externalUrls),
      businessCategoryName: item.businessCategoryName ?? null,
      highlightReelCount: toNullableNumber(item.highlightReelCount),
      followersCount:
        toNullableNumber(item.followersCount) ??
        toNullableNumber(item.followers) ??
        toNullableNumber(item.followers_count),
      followingCount:
        toNullableNumber(item.followsCount) ??
        toNullableNumber(item.following) ??
        toNullableNumber(item.followingCount) ??
        toNullableNumber(item.following_count),
      postsCount:
        toNullableNumber(item.postsCount) ??
        toNullableNumber(item.posts) ??
        toNullableNumber(item.posts_count),
      latestPosts: normalizePosts(item.latestPosts),
      latestVideos: normalizePosts(item.latestIgtvVideos),
      isPrivate: item.private ?? item.isPrivate ?? item.is_private ?? null,
      isVerified: item.verified ?? item.isVerified ?? item.is_verified ?? null,
    },
  };
}

async function fetchProfileFromHtml(username: string): Promise<FetchResult> {
  const response = await fetch(`https://www.instagram.com/${username}/`, {
    headers: {
      "User-Agent": INSTAGRAM_USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    return { status: "not-found" };
  }

  if (!response.ok) {
    return { status: "unavailable" };
  }

  const html = await response.text();
  const description = extractMetaContent(html, "og:description");
  const title = extractMetaContent(html, "og:title");
  const image = extractMetaContent(html, "og:image");

  const followersCount =
    extractCountFromGraph(html, "edge_followed_by") ??
    extractCountFromDescription(description, "followers");
  const followingCount =
    extractCountFromGraph(html, "edge_follow") ??
    extractCountFromDescription(description, "following");
  const postsCount =
    extractCountFromTimeline(html) ?? extractCountFromDescription(description, "posts");

  const fullName =
    extractJsonString(html, "full_name") ??
    extractNameFromTitle(title) ??
    username;

  const biography =
    extractJsonString(html, "biography") ?? extractBiographyFromDescription(description);

  const avatarUrl =
    extractJsonString(html, "profile_pic_url_hd") ??
    extractJsonString(html, "profile_pic_url") ??
    image;

  const externalUrl = extractJsonString(html, "external_url");
  const isPrivate = extractJsonBoolean(html, "is_private");
  const isVerified = extractJsonBoolean(html, "is_verified");

  if (
    !description &&
    !title &&
    !image &&
    followersCount == null &&
    followingCount == null &&
    postsCount == null &&
    !biography
  ) {
    return { status: "unavailable" };
  }

  return {
    status: "ok",
    seed: {
      username,
      fullName,
      biography,
      avatarUrl,
      externalUrl,
      followersCount,
      followingCount,
      postsCount,
      isPrivate,
      isVerified,
    },
  };
}

async function fetchProfileFromApi(username: string): Promise<FetchResult> {
  const response = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    {
      headers: {
        "User-Agent": INSTAGRAM_USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "application/json",
        "x-ig-app-id": INSTAGRAM_APP_ID,
        "x-requested-with": "XMLHttpRequest",
        Referer: `https://www.instagram.com/${username}/`,
      },
      next: { revalidate: 300 },
    }
  );

  if (response.status === 404) {
    return { status: "not-found" };
  }

  if (!response.ok) {
    return { status: "unavailable" };
  }

  const data = (await response.json()) as {
    data?: {
      user?: {
        full_name?: string;
        biography?: string;
        profile_pic_url_hd?: string;
        profile_pic_url?: string;
        external_url?: string;
        edge_followed_by?: { count?: number };
        edge_follow?: { count?: number };
        edge_owner_to_timeline_media?: { count?: number };
        is_private?: boolean;
        is_verified?: boolean;
      };
    };
  };

  const user = data?.data?.user;
  if (!user) {
    return { status: "unavailable" };
  }

  return {
    status: "ok",
    seed: {
      username,
      fullName: user.full_name ?? username,
      biography: user.biography ?? null,
      avatarUrl: user.profile_pic_url_hd ?? user.profile_pic_url ?? null,
      externalUrl: user.external_url ?? null,
      followersCount: user.edge_followed_by?.count ?? null,
      followingCount: user.edge_follow?.count ?? null,
      postsCount: user.edge_owner_to_timeline_media?.count ?? null,
      isPrivate: user.is_private ?? null,
      isVerified: user.is_verified ?? null,
    },
  };
}

async function fetchProfileFromEmbed(username: string): Promise<FetchResult> {
  const response = await fetch(`https://www.instagram.com/${username}/embed/`, {
    headers: {
      "User-Agent": INSTAGRAM_USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 300 },
  });

  if (response.status === 404) return { status: "not-found" };
  if (!response.ok) return { status: "unavailable" };

  const html = await response.text();
  
  const picMatch = html.match(/class="[^"]*EmbeddedProfilePic[^"]*"[^>]*src="([^"]+)"/i)
    || html.match(/profile_pic_url['":\s]+['"]([^'"]+)['"]/i)
    || html.match(/<img[^>]+src="(https:\/\/[^"]*cdninstagram[^"]*)"[^>]*>/i);
  
  const nameMatch = html.match(/<title>([^<]+)<\/title>/i);
  
  const jsonFollowers = html.match(/"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)\s*\}/i);

  if (!picMatch && !nameMatch && !jsonFollowers) {
    return { status: "unavailable" };
  }

  const avatarUrl = picMatch ? decodeHtmlEntities(picMatch[1].replace(/\\u0026/g, "&")) : null;
  const fullNameMatch = nameMatch ? nameMatch[1].replace(/ - Instagram$/, "").trim() : null;
  let fullName = username;
  if (fullNameMatch && fullNameMatch !== "Instagram") {
     fullName = fullNameMatch.split(" (@")[0];
  }
  
  const followersCount = jsonFollowers ? Number.parseInt(jsonFollowers[1], 10) : null;

  return {
    status: "ok",
    seed: {
      username,
      fullName,
      avatarUrl,
      followersCount,
    }
  };
}

function buildResponse(seed: ProfileSeed, source: ProfileSource) {
  const missingProviderToken = !APIFY_TOKEN;
  const auraAnalysis = calculateAuraFromProfile(seed);
  const statsAvailable = auraAnalysis.score != null;
  const score = auraAnalysis.score;

  const badgeDetails = score != null ? getBadgeAndDesc(score) : null;
  const externalLinks = buildExternalLinks(seed.externalLinks, seed.externalUrl);
  const latestPosts = (seed.latestPosts ?? []).slice(0, 9);
  const latestVideos = (seed.latestVideos ?? latestPosts.filter(isVideoPost)).slice(0, 9);

  return {
    username: seed.username,
    fullName: seed.fullName || seed.username,
    biography: seed.biography || null,
    avatarUrl: seed.avatarUrl || null,
    externalUrl: seed.externalUrl || externalLinks[0]?.url || null,
    externalLinks,
    profileUrl: `https://www.instagram.com/${seed.username}/`,
    businessCategoryName: seed.businessCategoryName || null,
    highlightReelCount: seed.highlightReelCount ?? null,
    followers: formatCount(seed.followersCount),
    following: formatCount(seed.followingCount),
    posts: formatCount(seed.postsCount),
    latestPosts,
    latestVideos,
    isPrivate: seed.isPrivate ?? null,
    isVerified: seed.isVerified ?? null,
    source,
    statsAvailable,
    score,
    scoreBreakdown: auraAnalysis.breakdown,
    badge:
      badgeDetails?.badge ??
      (source === "limited"
        ? missingProviderToken
          ? "MODE FALLBACK"
          : "PREVIEW TERBATAS"
        : source === "apify"
          ? "LIVE PROFILE"
          : seed.isPrivate
            ? "PRIVATE PROFILE"
            : "PUBLIC PREVIEW"),
    description:
      badgeDetails?.description ??
      (source === "limited"
        ? missingProviderToken
          ? "Live profile belum aktif karena APIFY_TOKEN belum diisi. Saat token tersedia, website bisa mengambil detail profil publik langsung tanpa harus buka Instagram dulu."
          : "Preview profil tetap muncul, tapi Instagram lagi membatasi metadata publik tanpa login."
        : source === "apify"
          ? "Profil publik dimuat lewat provider eksternal, jadi tidak perlu buka Instagram dulu untuk melihat detail dasarnya."
          : "Profil publik berhasil dimuat langsung di website tanpa perlu login Instagram."),
  };
}

interface ApifyExternalUrl {
  title?: string;
  url?: string;
  link_type?: string;
}

interface ApifyPostItem {
  id?: string | number;
  shortCode?: string;
  caption?: string;
  displayUrl?: string;
  url?: string;
  likesCount?: number | string;
  commentsCount?: number | string;
  timestamp?: string;
  type?: string;
  productType?: string;
  locationName?: string;
}

interface ApifyProfileItem {
  username?: string;
  fullName?: string;
  full_name?: string;
  biography?: string;
  bio?: string;
  profilePicUrlHD?: string;
  profilePicUrl?: string;
  profile_pic_url_hd?: string;
  profile_pic_url?: string;
  externalUrl?: string;
  external_url?: string;
  website?: string;
  externalUrls?: ApifyExternalUrl[];
  businessCategoryName?: string;
  highlightReelCount?: number | string;
  followersCount?: number | string;
  followers?: number | string;
  followers_count?: number | string;
  followsCount?: number | string;
  following?: number | string;
  followingCount?: number | string;
  following_count?: number | string;
  postsCount?: number | string;
  posts?: number | string;
  posts_count?: number | string;
  latestPosts?: ApifyPostItem[];
  latestIgtvVideos?: ApifyPostItem[];
  private?: boolean;
  isPrivate?: boolean;
  is_private?: boolean;
  verified?: boolean;
  isVerified?: boolean;
  is_verified?: boolean;
}

function extractMetaContent(html: string, key: string): string | null {
  const escapedKey = escapeForRegex(key);
  const propertyFirst = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const contentFirst = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`,
    "i"
  );

  const match = html.match(propertyFirst) ?? html.match(contentFirst);
  return match ? decodeHtmlEntities(match[1]) : null;
}

function extractJsonString(html: string, key: string): string | null {
  const match = html.match(new RegExp(`"${escapeForRegex(key)}":"((?:\\\\.|[^"\\\\])*)"`, "i"));
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return decodeHtmlEntities(match[1].replace(/\\\//g, "/").replace(/\\"/g, '"'));
  }
}

function extractJsonBoolean(html: string, key: string): boolean | null {
  const match = html.match(new RegExp(`"${escapeForRegex(key)}":(true|false)`, "i"));
  if (!match) {
    return null;
  }

  return match[1] === "true";
}

function extractCountFromGraph(html: string, key: string): number | null {
  const match = html.match(
    new RegExp(`"${escapeForRegex(key)}"\\s*:\\s*\\{\\s*"count"\\s*:\\s*(\\d+)`, "i")
  );

  return match ? Number.parseInt(match[1], 10) : null;
}

function extractCountFromTimeline(html: string): number | null {
  const match = html.match(/"edge_owner_to_timeline_media"\s*:\s*\{\s*"count"\s*:\s*(\d+)/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function extractCountFromDescription(
  description: string | null,
  label: "followers" | "following" | "posts"
): number | null {
  if (!description) {
    return null;
  }

  const match = description.match(new RegExp(`([\\d.,]+[KMB]?)\\s+${label}`, "i"));
  return match ? parseCompactNumber(match[1]) : null;
}

function extractNameFromTitle(title: string | null): string | null {
  if (!title) {
    return null;
  }

  const match = title.match(/^(.*?)\s+\(@/);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractBiographyFromDescription(description: string | null): string | null {
  if (!description) {
    return null;
  }

  const splitMarker = " on Instagram:";
  const markerIndex = description.indexOf(splitMarker);
  if (markerIndex === -1) {
    return null;
  }

  return description.slice(markerIndex + splitMarker.length).trim() || null;
}

function parseCompactNumber(value: string): number | null {
  const normalized = value.replace(/,/g, "").trim();
  const suffix = normalized.slice(-1).toUpperCase();
  const numericPart = /[KMB]/.test(suffix) ? normalized.slice(0, -1) : normalized;

  const parsed = Number.parseFloat(numericPart);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const multiplier =
    suffix === "K" ? 1_000 : suffix === "M" ? 1_000_000 : suffix === "B" ? 1_000_000_000 : 1;

  return Math.round(parsed * multiplier);
}

function formatCount(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function buildExternalLinks(
  links: ProfileExternalLink[] | null | undefined,
  fallbackUrl: string | null | undefined
): ProfileExternalLink[] {
  const normalized = (links ?? []).filter((link) => Boolean(link.url));

  if (normalized.length > 0) {
    return normalized;
  }

  if (!fallbackUrl) {
    return [];
  }

  return [
    {
      title: "Link di bio",
      url: fallbackUrl,
      type: "external",
    },
  ];
}

function normalizeExternalLinksFromApify(
  links: ApifyExternalUrl[] | null | undefined
): ProfileExternalLink[] {
  return (links ?? [])
    .map((link) => {
      if (!link.url) {
        return null;
      }

      return {
        title: link.title?.trim() || "Link",
        url: link.url,
        type: link.link_type ?? null,
      } satisfies ProfileExternalLink;
    })
    .filter((link): link is ProfileExternalLink => link !== null);
}

function normalizePosts(items: ApifyPostItem[] | null | undefined): ProfilePost[] {
  return (items ?? [])
    .map((item) => normalizePost(item))
    .filter((item): item is ProfilePost => item !== null);
}

function normalizePost(item: ApifyPostItem | null | undefined): ProfilePost | null {
  if (!item?.url) {
    return null;
  }

  return {
    id: String(item.id ?? item.shortCode ?? item.url),
    shortCode: item.shortCode ?? null,
    caption: item.caption ?? null,
    displayUrl: item.displayUrl ?? null,
    url: item.url,
    likesCount: toNullableNumber(item.likesCount),
    commentsCount: toNullableNumber(item.commentsCount),
    timestamp: item.timestamp ?? null,
    type: item.type ?? null,
    productType: item.productType ?? null,
    locationName: item.locationName ?? null,
  };
}

function isVideoPost(post: ProfilePost): boolean {
  const type = post.type?.toLowerCase() ?? "";
  const productType = post.productType?.toLowerCase() ?? "";

  return type === "video" || productType.includes("clip") || productType.includes("igtv");
}

function normalizeUsername(value: string | null | undefined): string {
  return (value ?? "").replace(/^@+/, "").trim().toLowerCase();
}

function sanitizeUsername(value: string | null): string {
  if (!value) {
    return "";
  }

  return normalizeUsername(value.replace(/\/$/, ""));
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const compact = parseCompactNumber(value);
    if (compact != null) {
      return compact;
    }

    const parsed = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function calculateAuraFromProfile(seed: ProfileSeed): {
  score: number | null;
  breakdown: ScoreBreakdown;
} {
  const breakdown: ScoreBreakdown = {
    profile: calculateProfileIdentityScore(seed),
    activity: calculateActivityScore(seed),
    engagement: calculateEngagementScore(seed),
    consistency: calculateConsistencyScore(seed),
  };

  const weights = {
    profile: 0.3,
    activity: 0.25,
    engagement: 0.3,
    consistency: 0.15,
  } as const;

  const availableWeight =
    (breakdown.profile > 0 ? weights.profile : 0) +
    (breakdown.activity > 0 ? weights.activity : 0) +
    (breakdown.engagement > 0 ? weights.engagement : 0) +
    (breakdown.consistency > 0 ? weights.consistency : 0);

  if (availableWeight === 0) {
    return {
      score: null,
      breakdown,
    };
  }

  const weightedScore =
    (breakdown.profile * weights.profile +
      breakdown.activity * weights.activity +
      breakdown.engagement * weights.engagement +
      breakdown.consistency * weights.consistency) /
    availableWeight;

  return {
    score: Number(clamp(weightedScore, 1, 9.9).toFixed(1)),
    breakdown,
  };
}

function calculateProfileIdentityScore(seed: ProfileSeed): number {
  let score = 0;

  if (seed.avatarUrl) score += 1.5;
  if (seed.biography) score += 2.8;
  if ((seed.externalLinks?.length ?? 0) > 0 || seed.externalUrl) score += 1.8;
  if (seed.businessCategoryName) score += 1.2;
  if (seed.fullName && normalizeUsername(seed.fullName) !== normalizeUsername(seed.username)) score += 1.0;
  if ((seed.highlightReelCount ?? 0) >= 6) score += 1.7;
  else if ((seed.highlightReelCount ?? 0) >= 3) score += 1.2;
  else if ((seed.highlightReelCount ?? 0) > 0) score += 0.7;
  if (seed.isVerified) score += 1.0;

  return Number(clamp(score, 0, 10).toFixed(1));
}

function calculateActivityScore(seed: ProfileSeed): number {
  const postsCount = seed.postsCount ?? 0;
  const mediaCount = seed.latestPosts?.length ?? 0;

  if (seed.postsCount == null && mediaCount === 0) {
    return 0;
  }

  let score = 0;

  if (postsCount >= 150) score += 7.0;
  else if (postsCount >= 80) score += 6.0;
  else if (postsCount >= 40) score += 5.0;
  else if (postsCount >= 20) score += 4.0;
  else if (postsCount >= 8) score += 2.8;
  else if (postsCount > 0) score += 1.5;

  if (mediaCount >= 9) score += 2.0;
  else if (mediaCount >= 6) score += 1.5;
  else if (mediaCount >= 3) score += 1.0;
  else if (mediaCount > 0) score += 0.5;

  return Number(clamp(score, 0, 10).toFixed(1));
}

function calculateEngagementScore(seed: ProfileSeed): number {
  const followers = seed.followersCount ?? 0;
  const posts = (seed.latestPosts ?? []).filter(
    (post) => post.likesCount != null || post.commentsCount != null
  );

  if (followers <= 0 || posts.length === 0) {
    return 0;
  }

  const totals = posts.reduce(
    (accumulator, post) => {
      accumulator.likes += post.likesCount ?? 0;
      accumulator.comments += post.commentsCount ?? 0;
      return accumulator;
    },
    { likes: 0, comments: 0 }
  );

  const averageInteractions = (totals.likes + totals.comments) / posts.length;
  const engagementRate = averageInteractions / Math.max(followers, 1);

  let score = 2.8;
  if (engagementRate >= 0.08) score = 10;
  else if (engagementRate >= 0.05) score = 9.0;
  else if (engagementRate >= 0.03) score = 8.0;
  else if (engagementRate >= 0.015) score = 6.8;
  else if (engagementRate >= 0.008) score = 5.5;
  else if (engagementRate >= 0.003) score = 4.2;

  return Number(clamp(score, 0, 10).toFixed(1));
}

function calculateConsistencyScore(seed: ProfileSeed): number {
  const posts = seed.latestPosts ?? [];
  if (posts.length === 0) {
    return 0;
  }

  const now = Date.now();
  const freshPosts = posts.filter((post) => {
    if (!post.timestamp) {
      return false;
    }

    const timestamp = new Date(post.timestamp).getTime();
    if (Number.isNaN(timestamp)) {
      return false;
    }

    const ageDays = (now - timestamp) / (1000 * 60 * 60 * 24);
    return ageDays <= 30;
  }).length;

  if (freshPosts >= 8) return 9.5;
  if (freshPosts >= 5) return 8.0;
  if (freshPosts >= 3) return 6.5;
  if (freshPosts >= 1) return 5.0;
  if (posts.some((post) => Boolean(post.timestamp))) return 2.5;

  return 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getBadgeAndDesc(score: number) {
  if (score >= 9) {
    return {
      badge: "STARBOY",
      description: "Aura selebgram 100%. Sekali post, notif jebol.",
    };
  }

  if (score >= 8) {
    return {
      badge: "AESTHETIC GOD",
      description: "Followers berkelas. Profilnya kuat, presence-nya kerasa.",
    };
  }

  if (score >= 6) {
    return {
      badge: "HUSTLER",
      description: "Akun rapi, aktif, dan masih punya aura yang solid.",
    };
  }

  if (score >= 4) {
    return {
      badge: "NPC TIER",
      description: "Masih aman, tapi feed dan reach-nya belum terlalu nendang.",
    };
  }

  return {
    badge: "MYSTERIOUS",
    description: "Low profile banget. Vibenya lebih ke silent mode.",
  };
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;/g, "'")
    .replace(/&#064;/g, "@")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/");
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
