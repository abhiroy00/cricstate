import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  createLookingPost,
  listLookingPosts,
  updateLookingPost,
} from "../../services/engagementService";

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

// Backend LookingPost -> local card shape used by Looking screens.
function fromApi(post) {
  const need = post.category || "Player";
  const needDetail = post.title || "";
  return {
    id: `api-${post.id}`,
    backendId: post.id,
    author: "You",
    team: "",
    mine: true,
    active: (post.status || "OPEN").toUpperCase() === "OPEN",
    pro: false,
    avatarEmoji: "🧑🏽",
    avatarBg: "#1E63D0",
    need,
    needDetail,
    line: post.description || `${need} (${needDetail})`,
    bullets: needDetail ? [`${need} (${needDetail})`] : [need],
    time: post.created_at ? new Date(post.created_at).toLocaleDateString() : "Recently",
    km: post.city || "-- KM",
    type: need,
  };
}

export function LookingProvider({ children }) {
  const [posts, setPosts] = useState(LOOKING_POSTS);

  // Load the user's real posts once; seeds stay as fallback offline.
  useEffect(() => {
    let alive = true;
    listLookingPosts({ limit: 50 })
      .then((page) => {
        if (!alive || !page?.items) return;
        setPosts((prev) => {
          const mine = prev.filter((p) => p.mine && !p.backendId);
          const remote = page.items.map(fromApi);
          const seeds = prev.filter((p) => !p.mine);
          return [...mine, ...remote, ...seeds];
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const addPost = useCallback((post) => {
    const local = { ...post, id: `mine-${Date.now()}`, active: true };
    setPosts((p) => [local, ...p]);
    // Persist in background; link the backend id when it arrives.
    createLookingPost({
      category: post.type || post.need || "Player",
      title: post.needDetail || post.need || "Looking",
      description: post.line || null,
      city: post.km && post.km !== "-- KM" ? post.km : null,
    })
      .then((created) => {
        setPosts((p) =>
          p.map((x) => (x.id === local.id ? { ...x, backendId: created.id } : x))
        );
      })
      .catch(() => {});
  }, []);

  const setPostActive = useCallback((id, active) => {
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, active } : x)));
    const target = posts.find((x) => x.id === id);
    if (target?.backendId) {
      updateLookingPost(target.backendId, { status: active ? "OPEN" : "CLOSED" }).catch(
        () => {}
      );
    }
  }, [posts]);

  const deletePost = useCallback((id) => {
    const target = posts.find((x) => x.id === id);
    if (target?.backendId) {
      updateLookingPost(target.backendId, { status: "CLOSED" }).catch(() => {});
    }
    setPosts((p) => p.filter((x) => x.id !== id));
  }, [posts]);

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
