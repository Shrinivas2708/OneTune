import type { ReactNode } from "react";

export type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
  delay?: 1 | 2;
};

export const features: Feature[] = [
  {
    title: "Unified search",
    description: "One query hits every provider. Results deduped, ranked, and ready to play.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Background playback",
    description: "Queue, skip, scrub, and control playback from the notification shade.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4M7 10l5-5 5 5M12 5v12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    delay: 1,
  },
  {
    title: "Offline downloads",
    description: "Save tracks to your phone and listen without a network connection.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3v12m0 0l4-4m-4 4L8 11M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    delay: 2,
  },
  {
    title: "Import anything",
    description: "Paste a Spotify, YouTube, or JioSaavn playlist, album, or track URL.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Your library",
    description: "Favorites, history, playlists, and imports — all in one place.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    delay: 1,
  },
  {
    title: "Your infrastructure",
    description: "Self-host the API. Your data, your rules, your deployment.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
    delay: 2,
  },
];

export type Vibe = {
  title: string;
  description: string;
  image: string;
  likes: string;
  delay?: 1 | 2 | 3;
};

export const vibes: Vibe[] = [
  {
    title: "Chill nights",
    description: "Lo-fi, acoustic, and slow burns for winding down.",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=600",
    likes: "82K likes",
  },
  {
    title: "Focus flow",
    description: "Instrumentals and ambient sets that stay out of your way.",
    image:
      "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400",
    likes: "64K likes",
    delay: 1,
  },
  {
    title: "Workout pump",
    description: "High-energy tracks when you need a push.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600",
    likes: "125K likes",
    delay: 2,
  },
  {
    title: "Road trip",
    description: "Download the queue before you lose signal.",
    image:
      "https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&q=80&w=600",
    likes: "91K likes",
    delay: 3,
  },
];

export type TrendingTrack = {
  rank: number;
  title: string;
  artist: string;
  tag: string;
  image: string;
};

export const trendingTracks: TrendingTrack[] = [
  {
    rank: 1,
    title: "Secrets",
    artist: "UV Jain",
    tag: "Hip-hop",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=300",
  },
  {
    rank: 2,
    title: "Believer",
    artist: "Imagine Dragons",
    tag: "Rock",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400",
  },
  {
    rank: 3,
    title: "Starboy",
    artist: "The Weeknd",
    tag: "Pop",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300",
  },
];
