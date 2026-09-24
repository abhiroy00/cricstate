import LeaderboardScreen from "./LeaderboardScreen";

const UMPIRES = [
  { id: "1", name: "Sher Singh", medal: false, matches: 37, points: 1600, rate: "₹3000/day, 1000/match", initials: "SS", bg: "#6E7F80" },
  { id: "2", name: "Alok Mishra", medal: false, matches: 7, points: 675, rate: "₹3000/day, 1500/match", initials: "AM", bg: "#7FB069" },
  { id: "3", name: "Rahul Rana", medal: false, matches: 14, points: 600, rate: "₹1500/day, 800/match", initials: "RR", bg: "#E4B33C" },
  { id: "4", name: "Shyam Sunder Sharma", medal: false, matches: 28, points: 600, rate: "₹3000/day, 1000/match", initials: "SS", bg: "#C0392B" },
  { id: "5", name: "ZAID", medal: true, matches: 44, points: 600, rate: "₹3000/day, 1000/match", initials: "Z", bg: "#B03A2E" },
  { id: "6", name: "Kavish", medal: false, matches: 4, points: 500, rate: "₹1300/day, 600/match", initials: "K", bg: "#AEB6BF" },
  { id: "7", name: "Anil Kumar", medal: false, matches: 17, points: 500, rate: "₹1000/day, 500/match", initials: "AK", bg: "#2F3B4C" },
  { id: "8", name: "Suraj Pandey", medal: false, matches: 20, points: 400, rate: "₹3000/day, 1000/match", initials: "SP", bg: "#7FB3D5" },
  { id: "9", name: "Akash", medal: false, matches: 3, points: 300, rate: "₹1200/day, 600/match", initials: "A", bg: "#82B77B" },
  { id: "10", name: "Sayansh Rishi", medal: false, matches: 1, points: 200, rate: "₹800/day, 600/match", initials: "SR", bg: "#7D6E8A" },
];

export default function UmpiresScreen({ navigation, route }) {
  return (
    <LeaderboardScreen
      navigation={navigation}
      city={route?.params?.city || "Delhi"}
      title="Umpires"
      role="umpires"
      statLabel="Matches Umpired"
      list={UMPIRES}
    />
  );
}
