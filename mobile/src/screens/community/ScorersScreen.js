import LeaderboardScreen from "./LeaderboardScreen";

const SCORERS = [
  { id: "1", name: "Sher Singh", medal: true, matches: 29, points: 1200, rate: "₹2500/day, 1000/match", initials: "SS", bg: "#6E7F80" },
  { id: "2", name: "Rahul Rana", medal: false, matches: 14, points: 500, rate: "₹1500/day, 800/match", initials: "RR", bg: "#2F3B4C" },
  { id: "3", name: "Zaid", medal: true, matches: 16, points: 500, rate: "₹2800/day, 800/match", initials: "Z", bg: "#B03A2E" },
  { id: "4", name: "Suraj Pandey", medal: false, matches: 16, points: 400, rate: "₹3000/day, 1000/match", initials: "SP", bg: "#7FB3D5" },
  { id: "5", name: "Rajender Singh Bisht", medal: true, matches: 94, points: 375, rate: "₹1500/day, 500/match", initials: "RB", bg: "#C9A227" },
  { id: "6", name: "Akash", medal: false, matches: 3, points: 300, rate: "₹1200/day, 600/match", initials: "A", bg: "#82B77B" },
  { id: "7", name: "R Rajput", medal: false, matches: 21, points: 300, rate: "₹1000/day, 500/match", initials: "RJ", bg: "#D8A7C8" },
  { id: "8", name: "Kavish Haswani", medal: false, matches: 3, points: 250, rate: "₹1200/day, 500/match", initials: "KH", bg: "#AEB6BF" },
  { id: "9", name: "SACHIN KUMAR", medal: false, matches: 3, points: 200, rate: "₹1000/day, 500/match", initials: "SK", bg: "#7D6E8A" },
];

export default function ScorersScreen({ navigation, route }) {
  return (
    <LeaderboardScreen
      navigation={navigation}
      city={route?.params?.city || "Delhi"}
      title="Scorers"
      role="scorers"
      statLabel="Matches Scored"
      list={SCORERS}
    />
  );
}
