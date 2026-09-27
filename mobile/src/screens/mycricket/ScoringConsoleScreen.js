import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { extractErrorMessage } from "../../services/api";
import { getMatch } from "../../services/matchService";
import {
  endMatch,
  getLiveState,
  recordDelivery,
  selectNextBowler,
  startNextInnings,
  undoLastDelivery,
} from "../../services/scoringService";
import { getRoster } from "../../services/teamService";
import { FlowScreen, avatarColor, initials, RED, TEAL } from "./startMatch/flow";

const WICKET_TYPES = ["BOWLED", "CAUGHT", "LBW", "RUN_OUT", "STUMPED", "HIT_WICKET", "OTHER"];

function PadButton({ label, sub, tone, onPress, disabled, style }) {
  const light = tone === "four" || tone === "six" || tone === "out";
  const toneStyle =
    tone === "four"
      ? styles.padFour
      : tone === "six"
      ? styles.padSix
      : tone === "undo"
      ? styles.padUndo
      : tone === "out"
      ? styles.padOut
      : styles.padNeutral;
  return (
    <TouchableOpacity
      style={[styles.padBtn, toneStyle, disabled && styles.padDisabled, style]}
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.padLabel, light ? styles.padLabelLight : tone === "undo" ? styles.padLabelUndo : styles.padLabelDark]}>
        {label}
      </Text>
      {sub ? <Text style={[styles.padSub, light && styles.padSubLight]}>{sub}</Text> : null}
    </TouchableOpacity>
  );
}

function TeamBadge({ team }) {
  if (!team) return null;
  return (
    <View style={[styles.teamBadge, { backgroundColor: avatarColor(team.id) }]}>
      {team.logo_url ? (
        <Image source={{ uri: team.logo_url }} style={styles.teamBadgeImg} />
      ) : (
        <Text style={styles.teamBadgeText}>{initials(team.name)}</Text>
      )}
    </View>
  );
}

function BatsmanRow({ player, runs, balls, striker }) {
  const name = player?.full_name || "—";
  return (
    <View style={[styles.batsmanCard, striker && styles.batsmanCardStriker]}>
      <View style={[styles.batsmanAvatar, { backgroundColor: avatarColor(player?.id || name) }]}>
        {player?.profile_photo_url ? (
          <Image source={{ uri: player.profile_photo_url }} style={styles.batsmanAvatarImg} />
        ) : (
          <Text style={styles.batsmanAvatarText}>{initials(name)}</Text>
        )}
      </View>
      <View style={styles.batsmanInfo}>
        <Text style={styles.batsmanName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.batsmanRuns}>
          {runs} <Text style={styles.batsmanBalls}>({balls})</Text>
        </Text>
        <View style={[styles.statusPill, striker ? styles.statusPillStriker : styles.statusPillNon]}>
          <Text style={[styles.statusPillText, striker ? styles.statusPillTextStriker : styles.statusPillTextNon]}>
            {striker ? "STRIKER" : "NON-STRIKER"}
          </Text>
        </View>
      </View>
    </View>
  );
}

function deliveryLabel(delivery) {
  if (!delivery) return "•";
  if (delivery.is_wicket) return "W";
  const extra = delivery.extra_type;
  if (extra && extra !== "NONE") {
    const map = { WIDE: "WD", NO_BALL: "NB", BYE: "B", LEG_BYE: "LB" };
    return map[extra] || "E";
  }
  return String(delivery.runs_off_bat ?? 0);
}

function lastBallText(delivery) {
  if (!delivery) return "No deliveries yet";
  if (delivery.is_wicket) return "Wicket";
  const extra = delivery.extra_type;
  if (extra && extra !== "NONE") return `${extra.replace("_", " ")} +${delivery.extra_runs}`;
  const runs = delivery.runs_off_bat ?? 0;
  if (runs === 0) return "Dot ball";
  if (runs === 4) return "FOUR";
  if (runs === 6) return "SIX";
  return `${runs} run${runs > 1 ? "s" : ""}`;
}

function ShortcutsCard() {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.shortcutsHeader}
        activeOpacity={0.8}
        onPress={() => setOpen((value) => !value)}
      >
        <Text style={styles.shortcutsTitle}>⚡  Scoring shortcuts</Text>
        <Text style={styles.shortcutsChevron}>{open ? "▾" : "▸"}</Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.shortcutsBody}>
          <Text style={styles.shortcutsLine}>• 0–7 record runs off the bat.</Text>
          <Text style={styles.shortcutsLine}>• WD / NB / BYE / LB record extras.</Text>
          <Text style={styles.shortcutsLine}>• OUT opens the wicket sheet.</Text>
          <Text style={styles.shortcutsLine}>• UNDO reverts the last delivery.</Text>
        </View>
      ) : null}
    </View>
  );
}

function PlayerRow({ player, onPress }) {
  return (
    <TouchableOpacity style={styles.pickRow} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.pickAvatar, { backgroundColor: avatarColor(player.id) }]}>
        {player.profile_photo_url ? (
          <Image source={{ uri: player.profile_photo_url }} style={styles.pickImg} />
        ) : (
          <Text style={styles.pickAvatarText}>{initials(player.full_name)}</Text>
        )}
      </View>
      <Text style={styles.pickName} numberOfLines={1}>
        {player.full_name}
      </Text>
    </TouchableOpacity>
  );
}

export default function ScoringConsoleScreen({ navigation, route }) {
  const { matchId } = route.params || {};
  const [match, setMatch] = useState(null);
  const [live, setLive] = useState(null);
  const [rosterA, setRosterA] = useState([]);
  const [rosterB, setRosterB] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [extra, setExtra] = useState(null); // { type, runs }
  const [wicketOpen, setWicketOpen] = useState(false);
  const [wicketType, setWicketType] = useState("BOWLED");
  const [outId, setOutId] = useState("");
  const [fielderId, setFielderId] = useState("");
  const [nextBatsmanId, setNextBatsmanId] = useState("");
  const [runsWithWicket, setRunsWithWicket] = useState(0);

  const [bowlerOpen, setBowlerOpen] = useState(false);
  const [nextBowlerId, setNextBowlerId] = useState("");

  const [inningsOpen, setInningsOpen] = useState(false);
  const [niStriker, setNiStriker] = useState(null);
  const [niNonStriker, setNiNonStriker] = useState(null);
  const [niBowler, setNiBowler] = useState(null);
  const [niPicker, setNiPicker] = useState(null);

  // Synchronous in-flight guard: the state flag alone can lag a render behind
  // a rapid double tap, so this prevents two deliveries from one physical tap.
  const inFlight = useRef(false);
  const lastApplyAt = useRef(0);

  // Full load: match + live state + both rosters. Only needed on mount/focus
  // and after the match ends, because none of these change ball-to-ball.
  const load = useCallback(async () => {
    try {
      setError("");
      const matchData = await getMatch(matchId);
      setMatch(matchData);
      const state = await getLiveState(matchId);
      setLive(state);
      const [rA, rB] = await Promise.all([
        getRoster(matchData.team_a.id),
        getRoster(matchData.team_b.id),
      ]);
      setRosterA(rA || []);
      setRosterB(rB || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Light refresh: only the live state changes after a delivery / undo /
  // bowler change, so we avoid re-fetching the match and both rosters per ball.
  const refreshLive = useCallback(async () => {
    const state = await getLiveState(matchId);
    setLive(state);
  }, [matchId]);

  // Runs one server mutation and then refreshes. Serialized via inFlight so a
  // single tap produces exactly one request/delivery. The mutation response
  // embeds the new live state, so no follow-up GET /live is needed.
  async function run(action, { fullReload = false } = {}) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    const t0 = Date.now();
    try {
      const result = await action();
      const t1 = Date.now();
      if (fullReload) {
        await load();
      } else if (result && result.live) {
        lastApplyAt.current = Date.now();
        setLive(result.live);
      } else {
        // Backend without embedded live state: one fallback GET.
        await refreshLive();
      }
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          `[score-perf] tap→server ${t1 - t0}ms · apply ${Date.now() - t1}ms · total ${Date.now() - t0}ms`
        );
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    if (__DEV__ && lastApplyAt.current) {
      // eslint-disable-next-line no-console
      console.log(`[score-perf] server→UI ${Date.now() - lastApplyAt.current}ms`);
      lastApplyAt.current = 0;
    }
  }, [live]);

  function rosterFor(teamId) {
    if (!match) return [];
    return (teamId === match.team_a.id ? rosterA : rosterB).map((e) => e.player);
  }

  const innings = live?.innings;
  const battingPlayers = innings ? rosterFor(innings.batting_team_id) : [];
  const bowlingPlayers = innings ? rosterFor(innings.bowling_team_id) : [];
  const needsBowler = Boolean(innings) && !innings.current_bowler_id;
  const inningsOver = innings?.status === "COMPLETED";

  const battingTeam = useMemo(() => {
    if (!match || !innings) return null;
    return innings.batting_team_id === match.team_a.id ? match.team_a : match.team_b;
  }, [match, innings]);

  const bowlingTeam = useMemo(() => {
    if (!match || !innings) return null;
    return innings.batting_team_id === match.team_a.id ? match.team_b : match.team_a;
  }, [match, innings]);

  const nextBattingPlayers = useMemo(() => {
    if (!innings) return [];
    return rosterFor(innings.bowling_team_id);
  }, [innings, rosterA, rosterB, match]);
  const nextBowlingPlayers = useMemo(() => {
    if (!innings) return [];
    return rosterFor(innings.batting_team_id);
  }, [innings, rosterA, rosterB, match]);

  async function submit(payload) {
    await run(async () => {
      const result = await recordDelivery(matchId, payload);
      setWicketOpen(false);
      setExtra(null);
      setOutId("");
      setFielderId("");
      setNextBatsmanId("");
      setRunsWithWicket(0);
      return result;
    });
  }

  async function handleUndo() {
    await run(() => undoLastDelivery(matchId));
  }

  async function confirmExtra() {
    if (!extra) return;
    await submit({ extra_type: extra.type, extra_runs: Number(extra.runs) || 1 });
  }

  async function confirmWicket() {
    await submit({
      runs_off_bat: Number(runsWithWicket) || 0,
      is_wicket: true,
      wicket_type: wicketType,
      out_player_id: outId || undefined,
      fielder_id: fielderId || undefined,
      next_batsman_id: nextBatsmanId || undefined,
    });
  }

  async function confirmBowler() {
    if (!nextBowlerId) return;
    await run(async () => {
      const result = await selectNextBowler(matchId, nextBowlerId);
      setBowlerOpen(false);
      setNextBowlerId("");
      return result;
    });
  }

  async function handleEnd() {
    // Ending the match changes status/result_summary, so do a full reload.
    await run(() => endMatch(matchId), { fullReload: true });
  }

  async function confirmNextInnings() {
    if (!niStriker || !niNonStriker || !niBowler) {
      Alert.alert("Select players", "Choose striker, non-striker and bowler.");
      return;
    }
    if (niStriker.id === niNonStriker.id) {
      Alert.alert("Invalid selection", "Striker and non-striker must be different.");
      return;
    }
    await run(async () => {
      const result = await startNextInnings(matchId, {
        strikerId: niStriker.id,
        nonStrikerId: niNonStriker.id,
        bowlerId: niBowler.id,
      });
      setInningsOpen(false);
      setNiStriker(null);
      setNiNonStriker(null);
      setNiBowler(null);
      return result;
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={TEAL} />
      </View>
    );
  }

  const needFielder = ["CAUGHT", "STUMPED", "RUN_OUT"].includes(wicketType);

  return (
    <FlowScreen>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={8}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Live Match
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={load} style={styles.headerBtn} hitSlop={8}>
              <Text style={styles.headerIcon}>⟳</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("MatchDetail", { matchId })}
              style={styles.headerBtn}
              hitSlop={8}
            >
              <Text style={styles.headerIcon}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {!innings ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateText}>Match has not started.</Text>
            </View>
          ) : (
            <>
              {/* Score + teams */}
              <View style={styles.scoreCard}>
                <View style={styles.scoreTopRow}>
                  <View style={styles.livePill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                  <View style={styles.formatPill}>
                    <Text style={styles.formatText}>🏆 {match?.match_type || "MATCH"}</Text>
                  </View>
                </View>

                <View style={styles.scoreMainRow}>
                  <View style={styles.teamCol}>
                    <TeamBadge team={battingTeam} />
                    <Text style={styles.teamColName} numberOfLines={1}>
                      {battingTeam?.name || ""}
                    </Text>
                  </View>
                  <View style={styles.scoreCenter}>
                    <Text style={styles.scoreMain}>
                      {innings.total_runs}
                      <Text style={styles.scoreSlash}>/</Text>
                      {innings.total_wickets}
                    </Text>
                    <Text style={styles.scoreOvers}>
                      ({innings.overs_display}/{match?.overs_limit} Ov)
                    </Text>
                  </View>
                  <View style={styles.crrCol}>
                    <Text style={styles.crrLabel}>CRR</Text>
                    <Text style={styles.crrValue}>{(live.run_rate ?? 0).toFixed(2)}</Text>
                  </View>
                  <View style={styles.teamCol}>
                    <TeamBadge team={bowlingTeam} />
                    <Text style={styles.teamColName} numberOfLines={1}>
                      {bowlingTeam?.name || ""}
                    </Text>
                  </View>
                </View>

                <View style={styles.rrrRow}>
                  <Text style={styles.rrrText}>
                    RRR{" "}
                    <Text style={styles.rrrValue}>
                      {live.required_run_rate != null ? live.required_run_rate.toFixed(2) : "—"}
                    </Text>
                  </Text>
                  <View style={styles.rrrDivider} />
                  <Text style={styles.rrrText}>
                    Target <Text style={styles.rrrValue}>{innings.target != null ? innings.target : "—"}</Text>
                  </Text>
                </View>
              </View>

              {/* Batsmen + bowler */}
              <View style={styles.midRow}>
                <View style={[styles.card, styles.batsmenCard]}>
                  <Text style={styles.cardTitle}>🏏 BATSMEN</Text>
                  <BatsmanRow player={live.striker} runs={live.striker_runs} balls={live.striker_balls} striker />
                  <BatsmanRow
                    player={live.non_striker}
                    runs={live.non_striker_runs}
                    balls={live.non_striker_balls}
                  />
                </View>

                <View style={[styles.card, styles.bowlerCard]}>
                  <Text style={styles.cardTitle}>⚾ BOWLER</Text>
                  <View style={styles.bowlerAvatarWrap}>
                    <View style={[styles.bowlerAvatar, { backgroundColor: avatarColor(live.bowler?.id || "b") }]}>
                      {live.bowler?.profile_photo_url ? (
                        <Image source={{ uri: live.bowler.profile_photo_url }} style={styles.bowlerAvatarImg} />
                      ) : (
                        <Text style={styles.bowlerAvatarText}>
                          {live.bowler ? initials(live.bowler.full_name) : "—"}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.bowlerName} numberOfLines={1}>
                    {live.bowler?.full_name || "Not selected"}
                  </Text>
                  {live.bowler ? (
                    <Text style={styles.bowlerFigures}>
                      {live.bowler_overs}-{live.bowler_runs_conceded}-{live.bowler_wickets}
                    </Text>
                  ) : null}
                  <View style={styles.overPill}>
                    <Text style={styles.overPillText}>
                      OVER {Math.floor(innings.legal_balls_bowled / 6) + 1}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Scoring pad / states */}
              {inningsOver ? (
                <View style={styles.stateCard}>
                  <Text style={styles.stateText}>Innings complete.</Text>
                  <TouchableOpacity style={styles.stateBtn} onPress={() => setInningsOpen(true)} disabled={busy}>
                    <Text style={styles.stateBtnText}>Start next innings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.stateBtn, styles.stateBtnDanger]}
                    onPress={handleEnd}
                    disabled={busy}
                  >
                    <Text style={styles.stateBtnText}>End match</Text>
                  </TouchableOpacity>
                </View>
              ) : needsBowler ? (
                <View style={styles.stateCard}>
                  <Text style={styles.stateText}>Select the next over&apos;s bowler</Text>
                  <TouchableOpacity style={styles.stateBtn} onPress={() => setBowlerOpen(true)} disabled={busy}>
                    <Text style={styles.stateBtnText}>Choose bowler</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.padCard}>
                  <View style={styles.padArea}>
                    <View style={styles.padGrid}>
                      <View style={styles.padRow}>
                        <PadButton label="0" onPress={() => submit({ runs_off_bat: 0 })} disabled={busy} />
                        <PadButton label="1" onPress={() => submit({ runs_off_bat: 1 })} disabled={busy} />
                        <PadButton label="2" onPress={() => submit({ runs_off_bat: 2 })} disabled={busy} />
                      </View>
                      <View style={styles.padRow}>
                        <PadButton label="3" onPress={() => submit({ runs_off_bat: 3 })} disabled={busy} />
                        <PadButton
                          label="4"
                          sub="FOUR"
                          tone="four"
                          onPress={() => submit({ runs_off_bat: 4 })}
                          disabled={busy}
                        />
                        <PadButton
                          label="6"
                          sub="SIX"
                          tone="six"
                          onPress={() => submit({ runs_off_bat: 6 })}
                          disabled={busy}
                        />
                      </View>
                      <View style={styles.padRow}>
                        <PadButton
                          label="WD"
                          sub="WIDE"
                          tone="extra"
                          onPress={() => setExtra({ type: "WIDE", runs: "1" })}
                          disabled={busy}
                        />
                        <PadButton
                          label="NB"
                          sub="NO BALL"
                          tone="extra"
                          onPress={() => setExtra({ type: "NO_BALL", runs: "1" })}
                          disabled={busy}
                        />
                        <PadButton
                          label="BYE"
                          sub="BYE"
                          tone="extra"
                          onPress={() => setExtra({ type: "BYE", runs: "1" })}
                          disabled={busy}
                        />
                      </View>
                      <View style={styles.padRow}>
                        <PadButton
                          label="LB"
                          sub="LEG BYE"
                          tone="extra"
                          onPress={() => setExtra({ type: "LEG_BYE", runs: "1" })}
                          disabled={busy}
                        />
                        <PadButton label="5" onPress={() => submit({ runs_off_bat: 5 })} disabled={busy} />
                        <PadButton label="7" onPress={() => submit({ runs_off_bat: 7 })} disabled={busy} />
                      </View>
                    </View>

                    <View style={styles.padSide}>
                      <PadButton
                        label="↺"
                        sub="UNDO"
                        tone="undo"
                        onPress={handleUndo}
                        disabled={busy}
                        style={styles.padSideBtn}
                      />
                      <PadButton
                        label="OUT"
                        tone="out"
                        onPress={() => setWicketOpen(true)}
                        disabled={busy}
                        style={styles.padSideBtn}
                      />
                    </View>
                  </View>
                </View>
              )}

              <ShortcutsCard />

              {/* Last ball + recent deliveries */}
              <View style={styles.card}>
                <View style={styles.lastBallRow}>
                  <View style={styles.lastBallIcon}>
                    <Text style={styles.lastBallIconText}>🏏</Text>
                  </View>
                  <View style={styles.lastBallInfo}>
                    <Text style={styles.lastBallTitle}>Last Ball</Text>
                    <Text style={styles.lastBallValue}>
                      {lastBallText(live.recent_deliveries?.[0])}
                    </Text>
                  </View>
                  <View style={styles.recentBalls}>
                    {(live.recent_deliveries || [])
                      .slice(0, 6)
                      .reverse()
                      .map((delivery, index) => {
                        const label = deliveryLabel(delivery);
                        const strong = label === "4" || label === "6" || label === "W";
                        return (
                          <View
                            key={`${index}-${label}`}
                            style={[styles.recentChip, strong && styles.recentChipStrong, label === "6" && styles.recentChipSix]}
                          >
                            <Text style={[styles.recentChipText, strong && styles.recentChipTextLight]}>{label}</Text>
                          </View>
                        );
                      })}
                  </View>
                </View>
              </View>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

      {/* Extra runs modal */}
      <Modal transparent visible={extra !== null} animationType="fade" onRequestClose={() => setExtra(null)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{extra?.type?.replace("_", " ")}</Text>
            <Text style={styles.modalLabel}>
              {extra?.type === "WIDE" || extra?.type === "NO_BALL" ? "Total extra runs" : "Runs run"}
            </Text>
            <View style={styles.stepRow}>
              {["1", "2", "3", "4", "5"].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.stepBtn, extra?.runs === n && styles.stepBtnOn]}
                  onPress={() => setExtra((prev) => ({ ...prev, runs: n }))}
                >
                  <Text style={[styles.stepText, extra?.runs === n && styles.stepTextOn]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setExtra(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmExtra}>
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Wicket modal */}
      <Modal transparent visible={wicketOpen} animationType="slide" onRequestClose={() => setWicketOpen(false)}>
        <View style={styles.backdrop}>
          <ScrollView style={styles.modalSheet} contentContainerStyle={styles.modalSheetContent}>
            <Text style={styles.modalTitle}>Wicket</Text>
            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.wrapChips}>
              {WICKET_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.smallChip, wicketType === t && styles.smallChipOn]}
                  onPress={() => setWicketType(t)}
                >
                  <Text style={[styles.smallChipText, wicketType === t && styles.smallChipTextOn]}>
                    {t.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Batsman out</Text>
            <View style={styles.wrapChips}>
              <TouchableOpacity
                style={[styles.smallChip, !outId && styles.smallChipOn]}
                onPress={() => setOutId("")}
              >
                <Text style={[styles.smallChipText, !outId && styles.smallChipTextOn]}>Striker</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallChip, outId === live.non_striker?.id && styles.smallChipOn]}
                onPress={() => setOutId(live.non_striker?.id || "")}
              >
                <Text style={[styles.smallChipText, outId === live.non_striker?.id && styles.smallChipTextOn]}>
                  Non-striker
                </Text>
              </TouchableOpacity>
            </View>

            {needFielder ? (
              <>
                <Text style={styles.modalLabel}>Fielder (fielding side)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hList}>
                  {bowlingPlayers.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.smallChip, fielderId === p.id && styles.smallChipOn]}
                      onPress={() => setFielderId(p.id)}
                    >
                      <Text style={[styles.smallChipText, fielderId === p.id && styles.smallChipTextOn]}>
                        {p.full_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <Text style={styles.modalLabel}>Runs completed before wicket</Text>
            <View style={styles.stepRow}>
              {["0", "1", "2", "3", "4", "6"].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.stepBtn, String(runsWithWicket) === n && styles.stepBtnOn]}
                  onPress={() => setRunsWithWicket(Number(n))}
                >
                  <Text style={[styles.stepText, String(runsWithWicket) === n && styles.stepTextOn]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Next batsman</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hList}>
              {battingPlayers
                .filter(
                  (p) =>
                    p.id !== live.striker?.id &&
                    p.id !== live.non_striker?.id &&
                    p.id !== outId
                )
                .map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.smallChip, nextBatsmanId === p.id && styles.smallChipOn]}
                    onPress={() => setNextBatsmanId(p.id)}
                  >
                    <Text style={[styles.smallChipText, nextBatsmanId === p.id && styles.smallChipTextOn]}>
                      {p.full_name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setWicketOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmWicket}>
                <Text style={styles.confirmText}>Confirm wicket</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Next bowler modal */}
      <Modal transparent visible={bowlerOpen} animationType="slide" onRequestClose={() => setBowlerOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select bowler</Text>
            <ScrollView style={styles.pickList}>
              {bowlingPlayers.map((p) => (
                <PlayerRow key={p.id} player={p} onPress={() => setNextBowlerId(p.id)} />
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setBowlerOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmBowler}>
                <Text style={styles.confirmText}>Confirm bowler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Next innings modal */}
      <Modal transparent visible={inningsOpen} animationType="slide" onRequestClose={() => setInningsOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Start next innings</Text>
            <TouchableOpacity style={styles.slotPick} onPress={() => setNiPicker("striker")}>
              <Text style={styles.slotPickLabel}>Striker</Text>
              <Text style={styles.slotPickValue}>{niStriker?.full_name || "Select"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.slotPick} onPress={() => setNiPicker("nonStriker")}>
              <Text style={styles.slotPickLabel}>Non-striker</Text>
              <Text style={styles.slotPickValue}>{niNonStriker?.full_name || "Select"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.slotPick} onPress={() => setNiPicker("bowler")}>
              <Text style={styles.slotPickLabel}>Bowler</Text>
              <Text style={styles.slotPickValue}>{niBowler?.full_name || "Select"}</Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setInningsOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmNextInnings}>
                <Text style={styles.confirmText}>Start innings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Nested picker for next innings */}
      <Modal transparent visible={niPicker !== null} animationType="slide" onRequestClose={() => setNiPicker(null)}>
        <View style={styles.backdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              {niPicker === "bowler" ? "Select bowler" : "Select batsman"}
            </Text>
            <ScrollView style={styles.pickList}>
              {(niPicker === "bowler" ? nextBowlingPlayers : nextBattingPlayers).map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  onPress={() => {
                    if (niPicker === "striker") setNiStriker(p);
                    else if (niPicker === "nonStriker") setNiNonStriker(p);
                    else setNiBowler(p);
                    setNiPicker(null);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F5F7" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: RED,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  headerBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  headerIcon: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerTitle: { flex: 1, color: "#fff", fontSize: 20, fontWeight: "800", marginLeft: 6 },
  headerRight: { flexDirection: "row", alignItems: "center" },

  body: { flex: 1 },
  bodyContent: { padding: 12, paddingBottom: 24 },

  // Shared card
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEEFF2",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 12, fontWeight: "800", color: "#5A6472", letterSpacing: 0.5, marginBottom: 8 },

  // Score card
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEEFF2",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  scoreTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: RED,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff", marginRight: 5 },
  liveText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  formatPill: { backgroundColor: "#FDE7E8", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  formatText: { color: RED, fontSize: 11, fontWeight: "800" },

  scoreMainRow: { flexDirection: "row", alignItems: "center" },
  teamCol: { flex: 1, alignItems: "center" },
  teamBadge: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  teamBadgeImg: { width: 48, height: 48 },
  teamBadgeText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  teamColName: { fontSize: 12, color: "#333", fontWeight: "700", marginTop: 6, maxWidth: 92, textAlign: "center" },
  scoreCenter: { flex: 1.2, alignItems: "center" },
  scoreMain: { fontSize: 40, fontWeight: "900", color: "#111" },
  scoreSlash: { color: "#B0B6BE", fontWeight: "900" },
  scoreOvers: { fontSize: 12, color: "#7A8290", marginTop: 2 },
  crrCol: { flex: 0.8, alignItems: "center" },
  crrLabel: { fontSize: 11, color: "#7A8290", fontWeight: "700" },
  crrValue: { fontSize: 18, color: "#111", fontWeight: "800", marginTop: 2 },

  rrrRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#F6F7F9",
    borderRadius: 10,
    paddingVertical: 8,
  },
  rrrText: { color: "#5A6472", fontSize: 13, fontWeight: "600" },
  rrrValue: { color: "#111", fontWeight: "800" },
  rrrDivider: { width: 1, height: 16, backgroundColor: "#DDE1E6", marginHorizontal: 18 },

  midRow: { flexDirection: "row" },
  batsmenCard: { flex: 2, marginRight: 8 },
  bowlerCard: { flex: 1 },

  batsmanCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEFF2",
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  batsmanCardStriker: { borderLeftWidth: 4, borderLeftColor: TEAL, backgroundColor: "#F1FAF4" },
  batsmanAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  batsmanAvatarImg: { width: 40, height: 40 },
  batsmanAvatarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  batsmanInfo: { flex: 1, marginLeft: 10 },
  batsmanName: { fontSize: 14, fontWeight: "700", color: "#111" },
  batsmanRuns: { fontSize: 15, fontWeight: "800", color: "#111", marginTop: 1 },
  batsmanBalls: { fontSize: 12, fontWeight: "600", color: "#7A8290" },
  statusPill: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  statusPillStriker: { backgroundColor: TEAL },
  statusPillNon: { backgroundColor: "#E9ECF1" },
  statusPillText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.4 },
  statusPillTextStriker: { color: "#fff" },
  statusPillTextNon: { color: "#7A8290" },

  bowlerAvatarWrap: { alignItems: "center", marginBottom: 6 },
  bowlerAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  bowlerAvatarImg: { width: 52, height: 52 },
  bowlerAvatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  bowlerName: { fontSize: 14, fontWeight: "700", color: "#111", textAlign: "center" },
  bowlerFigures: { fontSize: 13, fontWeight: "700", color: "#5A6472", textAlign: "center", marginTop: 3 },
  overPill: { alignSelf: "center", backgroundColor: "#FDE7E8", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6 },
  overPillText: { color: RED, fontSize: 10, fontWeight: "800" },

  // Keypad
  padCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEEFF2",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  padArea: { flexDirection: "row" },
  padGrid: { flex: 3, marginRight: 8 },
  padRow: { flexDirection: "row", marginBottom: 8 },
  padSide: { flex: 1, justifyContent: "space-between" },
  padSideBtn: { flex: 1, marginBottom: 8 },
  padBtn: {
    flex: 1,
    minHeight: 58,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E6E9ED",
    backgroundColor: "#F7F8FA",
  },
  padDisabled: { opacity: 0.5 },
  padNeutral: { backgroundColor: "#F7F8FA" },
  padFour: { backgroundColor: RED, borderColor: RED },
  padSix: { backgroundColor: "#F5A623", borderColor: "#F5A623" },
  padUndo: { backgroundColor: "#E7F6EC", borderColor: "#C7EAD2" },
  padOut: { backgroundColor: RED, borderColor: RED },
  padLabel: { fontSize: 24, fontWeight: "800" },
  padLabelDark: { color: "#222" },
  padLabelLight: { color: "#fff" },
  padLabelUndo: { color: TEAL, fontSize: 26 },
  padSub: { fontSize: 10, fontWeight: "700", color: "#7A8290", marginTop: 2, letterSpacing: 0.4 },
  padSubLight: { color: "#fff" },

  // Shortcuts
  shortcutsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  shortcutsTitle: { color: RED, fontSize: 14, fontWeight: "800" },
  shortcutsChevron: { color: RED, fontSize: 14, fontWeight: "800" },
  shortcutsBody: { paddingTop: 10 },
  shortcutsLine: { color: "#5A6472", fontSize: 12, marginBottom: 6 },

  // Last ball
  lastBallRow: { flexDirection: "row", alignItems: "center" },
  lastBallIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: RED, alignItems: "center", justifyContent: "center" },
  lastBallIconText: { fontSize: 18 },
  lastBallInfo: { marginLeft: 10, marginRight: 8 },
  lastBallTitle: { fontSize: 12, color: "#7A8290", fontWeight: "700" },
  lastBallValue: { fontSize: 14, color: "#111", fontWeight: "800", marginTop: 1 },
  recentBalls: { flex: 1, flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap" },
  recentChip: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#EDEFF3", alignItems: "center", justifyContent: "center", marginLeft: 5 },
  recentChipStrong: { backgroundColor: "#FDE0E2" },
  recentChipSix: { backgroundColor: "#FBE9C9" },
  recentChipText: { fontSize: 11, fontWeight: "800", color: "#5A6472" },
  recentChipTextLight: { color: "#B4471A" },

  // States
  stateCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEFF2",
  },
  stateText: { fontSize: 15, color: "#333", marginBottom: 14, textAlign: "center" },
  stateBtn: { backgroundColor: TEAL, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 13, marginBottom: 10, minWidth: 220, alignItems: "center" },
  stateBtnDanger: { backgroundColor: RED },
  stateBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  error: { color: RED, textAlign: "center", paddingVertical: 10 },

  // Modals (unchanged behaviour, restyled board)
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "82%",
    paddingTop: 16,
  },
  modalSheetContent: { paddingHorizontal: 18, paddingBottom: 26 },
  modalTitle: { fontSize: 19, fontWeight: "700", color: "#222", paddingHorizontal: 18, marginBottom: 8 },
  modalLabel: { fontSize: 13, color: "#777", marginTop: 14, marginBottom: 8, paddingHorizontal: 18 },
  stepRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 18 },
  stepBtn: {
    minWidth: 44,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  stepBtnOn: { backgroundColor: TEAL, borderColor: TEAL },
  stepText: { color: "#333", fontWeight: "600" },
  stepTextOn: { color: "#fff" },
  wrapChips: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 18 },
  hList: { paddingHorizontal: 18 },
  smallChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  smallChipOn: { backgroundColor: TEAL, borderColor: TEAL },
  smallChipText: { color: "#333", fontSize: 13, fontWeight: "500" },
  smallChipTextOn: { color: "#fff" },
  modalActions: { flexDirection: "row", paddingHorizontal: 18, marginTop: 18, marginBottom: 10 },
  modalBtn: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 6 },
  cancelBtn: { backgroundColor: "#F0F0F0", marginRight: 6 },
  cancelText: { color: "#5A6472", fontSize: 15, fontWeight: "600" },
  confirmBtn: { backgroundColor: TEAL, marginLeft: 6 },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  pickList: { paddingHorizontal: 18 },
  pickRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  pickAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  pickImg: { width: 44, height: 44 },
  pickAvatarText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  pickName: { flex: 1, marginLeft: 12, fontSize: 16, color: "#222", fontWeight: "500" },
  slotPick: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  slotPickLabel: { color: "#777", fontSize: 15 },
  slotPickValue: { color: "#222", fontSize: 15, fontWeight: "600", maxWidth: 200 },
});
