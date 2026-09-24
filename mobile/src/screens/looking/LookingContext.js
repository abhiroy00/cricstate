import { createContext, useCallback, useContext, useMemo, useState } from "react";

const LOOKING_POSTS = [
  {
    id: "1",
    author: "Tohid",
    team: "Unity Cricket Club DelhiX1",
    mine: false,
    active: true,
    pro: true,
    avatarEmoji: "🧑🏽",
    avatarBg: "#1E63D0",
    need: "Bowler",
    needDetail: "Right-arm medium",
    line: "Tohid's team (Unity Cricket Club DelhiX1) is looking for a Bowler (Right-arm medium) to join his team.",
    bullets: ["Bowler (Right-arm medium)"],
    time: "2 days ago",
    km: "-- KM",
    type: "Player",
  },
  {
    id: "2",
    author: "Ravi Shankar",
    team: "Sunday Smashers",
    mine: false,
    active: true,
    pro: false,
    avatarEmoji: "🧑🏻",
    avatarBg: "#0B6E4F",
    need: "Opponent",
    needDetail: "T20, this Sunday",
    line: "Ravi's team (Sunday Smashers) is looking for an Opponent (T20, this Sunday) to play a friendly match.",
    bullets: ["Opponent (T20, this Sunday)"],
    time: "5 hours ago",
    km: "3 KM",
    type: "Opponent",
  },
  {
    id: "3",
    author: "Imran Sheikh",
    team: "District Premier League",
    mine: false,
    active: true,
    pro: false,
    avatarEmoji: "🧑🏿",
    avatarBg: "#9A3412",
    need: "Umpire",
    needDetail: "Weekend league",
    line: "Imran (District Premier League) is looking for an Umpire (Weekend league) for official matches.",
    bullets: ["Umpire (Weekend league)"],
    time: "1 day ago",
    km: "7 KM",
    type: "Umpire",
  },
];

const LookingContext = createContext(null);

export function LookingProvider({ children }) {
  const [posts, setPosts] = useState(LOOKING_POSTS);

  const addPost = useCallback((post) => {
    setPosts((p) => [{ ...post, id: `mine-${Date.now()}`, active: true }, ...p]);
  }, []);

  const setPostActive = useCallback((id, active) => {
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, active } : x)));
  }, []);

  const deletePost = useCallback((id) => {
    setPosts((p) => p.filter((x) => x.id !== id));
  }, []);

  const value = useMemo(
    () => ({ posts, addPost, setPostActive, deletePost }),
    [posts, addPost, setPostActive, deletePost]
  );

  return <LookingContext.Provider value={value}>{children}</LookingContext.Provider>;
}

export function useLooking() {
  const ctx = useContext(LookingContext);
  if (!ctx) throw new Error("useLooking must be used within LookingProvider");
  return ctx;
}
