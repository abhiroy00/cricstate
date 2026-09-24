// CricHeroes-style leaderboard data — screenshots se liya hua
// Overall / Women's batting lists + Top Teams (empty by default, screenshot 4 jaisa)

export const BALL_TABS = ["Leather", "Tennis", "Box cricket"];
export const TEAM_BALL_TABS = ["Leather ball", "Tennis ball"];
export const SKILL_PILLS = ["Batting", "Bowling", "Fielding"];

export const OVERALL_BATTING = [
  { id: "1", name: "Praveen Channappa", city: "Bengaluru (Ba...", inn: 2275, runs: 88790, avg: 43.96, sr: 147.51, pro: false, bg: "#8D6E63" },
  { id: "2", name: "Dk4", city: "Delhi", inn: 2132, runs: 83173, avg: 54.79, sr: 158.9, pro: false, bg: "#B0BEC5" },
  { id: "3", name: "Vikrant Raj Salikeety", city: "Hyderabad (T...", inn: 2143, runs: 82235, avg: 56.95, sr: 179.75, pro: true, bg: "#FF8A65" },
  { id: "4", name: "Vaibhav Singh", city: "Ghaziabad", inn: 2131, runs: 77588, avg: 46.24, sr: 144.77, pro: true, bg: "#78909C" },
  { id: "5", name: "MD IMTIYAZ", city: "Hyderabad (Telangana)", inn: 2271, runs: 75569, avg: 35.5, sr: 194.84, pro: true, bg: "#FFD54F" },
  { id: "6", name: "Atul Kasana", city: "Gurugram ( Gurgaon )", inn: 1711, runs: 65087, avg: 44.86, sr: 161.24, pro: true, bg: "#4E342E" },
  { id: "7", name: "Veeru Chowdary", city: "Hyderabad (Telang...", inn: 1332, runs: 64943, avg: 54.62, sr: 165.37, pro: true, bg: "#1A237E" },
  { id: "8", name: "JAGADESHREDDY* ( JAGGU )", city: "Hy...", inn: 1628, runs: 61104, avg: 43.43, sr: 152.1, pro: false, bg: "#37474F" },
];

export const WOMENS_BATTING = [
  { id: "1", name: "Aarzoo Saini", city: "Kurukshetra", inn: 471, runs: 17957, avg: 44.23, sr: 92.16, pro: true, bg: "#7CB342" },
  { id: "2", name: "Tanika Sharma", city: "Jaipur", inn: 523, runs: 17176, avg: 41.89, sr: 85.79, pro: true, bg: "#1B5E20" },
  { id: "3", name: "Chhavi Gupta", city: "New Delhi", inn: 514, runs: 15837, avg: 36.74, sr: 82.58, pro: true, bg: "#EF6C00" },
  { id: "4", name: "Uma Kashvi", city: "Bengaluru (Bangalore)", inn: 426, runs: 14220, avg: 49.2, sr: 111.14, pro: true, bg: "#C0CA33" },
  { id: "5", name: "Nishika Singh", city: "New Delhi", inn: 269, runs: 13361, avg: 67.14, sr: 97.53, pro: true, bg: "#6D4C41" },
  { id: "6", name: "Sandhya GORA", city: "Hyderabad (Telanga...", inn: 382, runs: 11503, avg: 38.34, sr: 75.87, pro: false, bg: "#0277BD" },
  { id: "7", name: "Riya Bhati", city: "Meerut", inn: 349, runs: 11330, avg: 37.03, sr: 95.96, pro: false, bg: "#9E9E9E" },
  { id: "8", name: "Suhaanii Kahandall", city: "Pune", inn: 324, runs: 11268, avg: 42.52, sr: 88.4, pro: false, bg: "#0D47A1" },
];

// Bowling / Fielding ke liye same names, alag numbers (demo ranking)
export const OVERALL_BOWLING = OVERALL_BATTING.map((p, i) => ({
  ...p,
  runs: 900 - i * 42,
  inn: 320 - i * 12,
  avg: 14.2 + i * 0.6,
  sr: 11.4 + i * 0.4,
}));

export const OVERALL_FIELDING = OVERALL_BATTING.map((p, i) => ({
  ...p,
  runs: 210 - i * 9,
  inn: 320 - i * 10,
  avg: 2.1 + i * 0.1,
  sr: 0,
}));

export const WOMENS_BOWLING = WOMENS_BATTING.map((p, i) => ({
  ...p,
  runs: 320 - i * 18,
  inn: 180 - i * 8,
  avg: 13.8 + i * 0.5,
  sr: 12.1 + i * 0.3,
}));

export const WOMENS_FIELDING = WOMENS_BATTING.map((p, i) => ({
  ...p,
  runs: 96 - i * 5,
  inn: 180 - i * 6,
  avg: 1.8 + i * 0.1,
  sr: 0,
}));

export function boardFor(type, skill) {
  const isWomen = type === "womens";
  if (skill === "Bowling") return isWomen ? WOMENS_BOWLING : OVERALL_BOWLING;
  if (skill === "Fielding") return isWomen ? WOMENS_FIELDING : OVERALL_FIELDING;
  return isWomen ? WOMENS_BATTING : OVERALL_BATTING;
}

export function subtitleFor(skill) {
  if (skill === "Bowling") return "Most wickets in India (All Time, All Overs)";
  if (skill === "Fielding") return "Most catches in India (All Time, All Overs)";
  return "Most runs in India (All Time, All Overs)";
}

// Top Teams — screenshot 4 me filter laga hone se empty hai
export const TOP_TEAMS_LEATHER = [];
export const TOP_TEAMS_TENNIS = [
  { id: "1", name: "Mumbai Blasters", city: "Mumbai", matches: 214, wins: 148, pro: true, bg: "#1565C0" },
  { id: "2", name: "Delhi Titans", city: "New Delhi", matches: 198, wins: 129, pro: true, bg: "#E01A22" },
];

export function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
