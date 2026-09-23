import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import MatchDetail from "../pages/MatchDetail";
import Matches from "../pages/Matches";
import PlayerDetail from "../pages/PlayerDetail";
import Players from "../pages/Players";
import Profile from "../pages/Profile";
import PublicProfile from "../pages/PublicProfile";
import Scorer from "../pages/Scorer";
import TeamDetail from "../pages/TeamDetail";
import Teams from "../pages/Teams";
import TournamentDetail from "../pages/TournamentDetail";
import Tournaments from "../pages/Tournaments";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/:userId" element={<PublicProfile />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<TeamDetail />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:playerId" element={<PlayerDetail />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:tournamentId" element={<TournamentDetail />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:matchId" element={<MatchDetail />} />
          <Route path="/matches/:matchId/scorer" element={<Scorer />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
