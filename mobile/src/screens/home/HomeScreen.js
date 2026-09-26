import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";

import { useAuth } from "../../hooks/useAuth";
import { getHomeFeed } from "../../services/homeService";
import { CLUB_POSTS, CONTACT_MATCHES, CRICKETERS } from "../../data/feedData";
import SearchOverlay from "../../components/SearchOverlay";
import AppLogo from "../../components/AppLogo";
import DreamHeader from "../../components/DreamHeader";
import ProPill from "../../components/ProPill";
import {
  BellGlyph,
  ChatGlyph,
  HeaderIconBtn,
  MenuGlyph,
  SearchGlyph,
} from "../../components/HeaderIcon";

const RED = "#E01A22";
const RED_DARK = "#A60E14";
const TEAL = "#00A651";
const ORANGE = "#F5A623";
const GREY_BG = "#F2F2F2";


const HIGHLIGHT_CARDS = [
  {
    id: "1",
    name: "Parth Shah",
    title: "Career Milestones",
    sub: "Completed 1000 career runs in limited overs",
    emoji: "🏏",
  },
  {
    id: "2",
    name: "Viswajitsinh Rathod",
    title: "Match Trophies",
    sub: "Won 1 player of the match trophy",
    emoji: "🏆",
  },
];


const JERSEYS = [
  { id: "1", color: "#1E63D0", accent: "#FF6B1A", name: "NISHANT GIRI", no: "88" },
  { id: "2", color: "#C0122E", accent: "#101828", name: "NISHANT GIRI", no: "88" },
  { id: "3", color: "#0B6E4F", accent: "#FFD23F", name: "NISHANT GIRI", no: "88" },
];

function Header({ onSearch, onBell, onInbox, onMenu, onPro, showBellDot = true }) {
  return (
    <DreamHeader style={styles.header}>
      <View style={styles.headerLeft}>
        <HeaderIconBtn onPress={onMenu} label="Menu">
          <MenuGlyph />
        </HeaderIconBtn>
        <AppLogo />
        <ProPill onPress={onPro} />
      </View>
      <View style={styles.headerRight}>
        <HeaderIconBtn onPress={onSearch} label="Search">
          <SearchGlyph />
        </HeaderIconBtn>
        <HeaderIconBtn onPress={onInbox} label="Messages">
          <ChatGlyph />
        </HeaderIconBtn>
        <HeaderIconBtn onPress={onBell} label="Notifications" dot={showBellDot}>
          <BellGlyph ring={showBellDot} />
        </HeaderIconBtn>
      </View>
    </DreamHeader>
  );
}

function TopTabs({ active, onChange }) {
  return (
    <View style={styles.tabsRow}>
      <TouchableOpacity
        style={[styles.tab, active === "foryou" && styles.tabActive]}
        onPress={() => onChange("foryou")}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.tabText, active === "foryou" && styles.tabTextActive]}
        >
          For you
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, active === "pro" && styles.tabActive]}
        onPress={() => onChange("pro")}
        activeOpacity={0.8}
      >
        <View style={styles.clubTab}>
          <View style={styles.proPill}>
            <Text style={styles.proPillText}>PRO</Text>
          </View>
          <Text style={styles.tabText}> Club</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function FollowPrompt({ name }) {
  return (
    <View style={styles.followRow}>
      <View style={styles.youCol}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🧑🏽</Text>
          <View style={styles.avatarPlus}>
            <Text style={styles.avatarPlusText}>＋</Text>
          </View>
        </View>
        <Text style={styles.youText}>You</Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>
          Follow your favourite cricketers to see their updates here.
        </Text>
      </View>
    </View>
  );
}

function MatchCard({ item, fullWidth }) {
  const live = item.status === "Live";
  return (
    <View style={[styles.matchCard, fullWidth && styles.matchCardFull]}>
      <View style={styles.matchHead}>
        <Text style={styles.matchOwner}>Match of {item.owner}</Text>
        <Text style={styles.matchHeadIcon}>👤−</Text>
      </View>
      <View style={styles.tournamentRow}>
        <Text style={styles.tournamentText} numberOfLines={1}>
          <Text style={styles.tournamentBold}>{item.tournament}, </Text>
          {item.league}
        </Text>
        <View
          style={[
            styles.statusPill,
            live ? styles.statusLive : styles.statusReview,
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.matchMeta} numberOfLines={1}>
        {item.meta}
      </Text>
      <View style={styles.scoreBlock}>
        <View style={styles.scoreRow}>
          <Text style={styles.teamName} numberOfLines={1}>
            {item.team1}
          </Text>
          <Text style={styles.scoreText}>
            {item.score1} <Text style={styles.oversText}>{item.overs1}</Text>
          </Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={[styles.teamName, styles.teamNameDim]} numberOfLines={1}>
            {item.team2}
          </Text>
          <Text style={[styles.scoreText, styles.scoreTextDim]}>
            {item.score2} <Text style={styles.oversText}>{item.overs2}</Text>
          </Text>
        </View>
      </View>
      <Text style={styles.resultText} numberOfLines={1}>
        {item.result}
      </Text>
      <View style={styles.matchLinks}>
        <TouchableOpacity hitSlop={8}>
          <Text style={styles.matchLink}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={8}>
          <Text style={styles.matchLink}>Table</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={8}>
          <Text style={styles.matchLink}>Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function HighlightsBanner() {
  return (
    <View style={styles.hlBanner}>
      <View style={styles.hlLeft}>
        <Text style={styles.hlIntro}>Introducing</Text>
        <Text style={styles.hlTitle}>Weekly{"\n"}Highlights</Text>
        <TouchableOpacity style={styles.hlBtn} activeOpacity={0.85}>
          <Text style={styles.hlBtnText}>Explore now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.hlRight}>
        {HIGHLIGHT_CARDS.map((c) => (
          <View key={c.id} style={styles.hlCard}>
            <View style={styles.hlAvatar}>
              <Text style={styles.hlAvatarEmoji}>{c.emoji}</Text>
            </View>
            <Text style={styles.hlCardName} numberOfLines={1}>
              {c.name}
            </Text>
            <Text style={styles.hlCardTitle} numberOfLines={1}>
              {c.title} ⭐
            </Text>
            <Text style={styles.hlCardSub} numberOfLines={2}>
              {c.sub}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CricketerCard({ item, followed, onToggle }) {
  return (
    <View style={styles.playerCard}>
      <View style={styles.playerPhoto}>
        <Text style={styles.playerEmoji}>{item.emoji}</Text>
        <View style={styles.playerShade}>
          <Text style={styles.playerName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.playerStats}>
            {item.runs}      {item.wkts}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.followBtn, followed && styles.followBtnDone]}
        activeOpacity={0.85}
        onPress={onToggle}
      >
        <Text
          style={[
            styles.followBtnText,
            followed && styles.followBtnTextDone,
          ]}
        >
          {followed ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function JerseyCard({ item, userName }) {
  return (
    <View style={styles.jerseyCard}>
      <View style={styles.jerseyStage}>
        <View
          style={[
            styles.jerseyShirt,
            styles.jerseyBack,
            { backgroundColor: item.color, borderColor: item.accent },
          ]}
        >
          <Text style={styles.jerseyCollar} />
          <Text style={styles.jerseyName} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.jerseyNo}>{item.no}</Text>
        </View>
        <View
          style={[
            styles.jerseyShirt,
            styles.jerseyFront,
            { backgroundColor: item.color, borderColor: item.accent },
          ]}
        >
          <Text style={styles.jerseyCollar} />
          <Text style={styles.jerseyBadge}>◉</Text>
        </View>
      </View>
    </View>
  );
}

function AdBanner() {
  return (
    <View style={styles.adWrap}>
      <Text style={styles.adInfo}>ⓘ</Text>
      <View style={styles.adBox}>
        <Text style={styles.adBrand}>
          Coin<Text style={styles.adBrandAccent}>DCX</Text>
        </Text>
        <View style={styles.adMid}>
          <Text style={styles.adTitle}>Tokenised NASDAQ, S&P500, Nikkei & More</Text>
          <View style={styles.adCta}>
            <Text style={styles.adCtaText}>Trade Now</Text>
          </View>
        </View>
      </View>
    </View>
  );
}


function ClubPostCard({ item, liked, likeCount, onLike }) {
  return (
    <View style={styles.clubCard}>
      <View style={styles.clubHead}>
        <View style={[styles.clubAvatar, { backgroundColor: item.avatarBg }]}>
          <Text style={styles.clubAvatarEmoji}>{item.avatarEmoji}</Text>
        </View>
        <Text style={styles.clubAuthor} numberOfLines={1}>
          {item.author} {item.verified ? <Text>✅</Text> : null}
        </Text>
        <Text style={styles.clubTime}>{item.time}</Text>
      </View>

      <Text style={styles.clubText}>{item.text}</Text>

      {item.poster && (
        <View style={styles.posterBox}>
          <Text style={styles.posterOrg}>{item.posterTitle}</Text>
          <Text style={styles.posterBig}>{item.posterBig}</Text>
          <Text style={styles.posterMeta}>{item.posterMeta}</Text>
          <Text style={styles.posterCta}>PLEASE DO COME AND SUPPORT 🩸</Text>
        </View>
      )}

      <View style={styles.clubActions}>
        <TouchableOpacity
          hitSlop={8}
          style={styles.clubAction}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.clubActionIcon, liked && styles.clubActionLiked]}
          >
            {liked ? "👍" : "♡"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={8} style={styles.clubAction} activeOpacity={0.7}>
          <Text style={styles.clubActionIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={8} style={styles.clubAction} activeOpacity={0.7}>
          <Text style={styles.clubActionIcon}>↗</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.clubStats}>
        <Text style={styles.clubStatsText}>
          ✅ {likeCount} reactions    {item.views}
        </Text>
        {item.comments > 0 && (
          <Text style={styles.clubStatsText}>{item.comments} comments</Text>
        )}
      </View>

      {item.topComment && (
        <View style={styles.clubComment}>
          <View style={styles.clubCommentAvatar}>
            <Text>{item.topComment.avatarEmoji}</Text>
          </View>
          <Text style={styles.clubCommentText}>
            <Text style={styles.clubCommentName}>
              {item.topComment.name}{" "}
            </Text>
            <Text style={styles.clubCommentBadge}>
              {item.topComment.badge}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

function ClubFeed({ userName }) {
  const [posts, setPosts] = useState(CLUB_POSTS);
  const [likes, setLikes] = useState({});
  const [myOnly, setMyOnly] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const toggleLike = (id) =>
    setLikes((p) => ({ ...p, [id]: !p[id] }));

  const submitPost = () => {
    const text = draft.trim();
    if (!text) return;
    setPosts((p) => [
      {
        id: `mine-${Date.now()}`,
        author: userName || "You",
        mine: true,
        verified: false,
        avatarEmoji: "🧑🏽",
        avatarBg: "#3A3A3A",
        time: "Just now",
        text,
        reactions: 0,
        views: "0 views",
        comments: 0,
        topComment: null,
      },
      ...p,
    ]);
    setDraft("");
    setComposerOpen(false);
  };

  const visible = myOnly ? posts.filter((p) => p.mine) : posts;

  return (
    <View style={styles.clubWrap}>
      <View style={styles.composerRow}>
        <TouchableOpacity
          style={styles.composerBox}
          activeOpacity={0.8}
          onPress={() => setComposerOpen(true)}
        >
          <Text style={styles.composerHint}>What's on your mind</Text>
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={10}
          style={styles.filterBtn}
          onPress={() => setMyOnly(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterLine, styles.filterLine1]}>―</Text>
          <Text style={[styles.filterLine, styles.filterLine2]}>―</Text>
          <Text style={[styles.filterLine, styles.filterLine3]}>―</Text>
        </TouchableOpacity>
      </View>

      {myOnly && (
        <View style={styles.myOnlyRow}>
          <Text style={styles.myOnlyText}>*Showing only your posts</Text>
          <TouchableOpacity hitSlop={8} onPress={() => setMyOnly(false)}>
            <Text style={styles.clearLink}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {visible.length === 0 ? (
        <View style={styles.clubEmpty}>
          <Text style={styles.clubEmptyLogo}>
            <Text style={styles.clubEmptyLogoRed}>⑩</Text>
            <Text style={styles.clubEmptyLogoPro}> PRO </Text>
            <Text>cric</Text>
            <Text style={styles.clubEmptyLogoRed}>heroes</Text>
          </Text>
          <Text style={styles.clubEmptyText}>
            It seems you have not posted anything yet. Now is as good time as
            any!
          </Text>
          <TouchableOpacity
            style={styles.hlBtn}
            activeOpacity={0.85}
            onPress={() => setComposerOpen(true)}
          >
            <Text style={styles.hlBtnText}>Create your first post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
          contentContainerStyle={styles.clubList}
          renderItem={({ item }) => (
            <ClubPostCard
              item={item}
              liked={!!likes[item.id]}
              likeCount={item.reactions + (likes[item.id] ? 1 : 0)}
              onLike={() => toggleLike(item.id)}
            />
          )}
        />
      )}

      <Modal
        visible={composerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setComposerOpen(false)}
      >
        <View style={styles.modalDim}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create post</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="What's on your mind"
              value={draft}
              onChangeText={setDraft}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setComposerOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPost}
                onPress={submitPost}
                activeOpacity={0.85}
              >
                <Text style={styles.modalPostText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const MATCH_FILTERS = ["All", "Live", "Upcoming", "Results"];

function AllMatchesView({ onBack, matches = CONTACT_MATCHES }) {
  const [filter, setFilter] = useState("All");

  const visible = matches.filter((m) => {
    if (filter === "All") return true;
    if (filter === "Live") return m.status === "Live";
    if (filter === "Upcoming") return m.status === "Upcoming";
    return m.status === "Completed" || m.status === "In review";
  });

  return (
    <View style={styles.allWrap}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>Matches of your contacts</Text>
      </TouchableOpacity>

      <View style={styles.chipsRow}>
        {MATCH_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                filter === f && styles.chipTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.allList}
        ListEmptyComponent={
          <Text style={styles.allEmpty}>
            No matches in this section yet.
          </Text>
        }
        renderItem={({ item }) => <MatchCard item={item} fullWidth />}
      />
    </View>
  );
}

const NOTIFICATIONS = [
  {
    id: "1",
    emoji: "🏆",
    title: "Match result out",
    body: "Pathsala Super Giants won by 67 runs against Tihu Rangers.",
    time: "20 min ago",
  },
  {
    id: "2",
    emoji: "💬",
    title: "New comment",
    body: "Arpit Kumar commented on CricHeroes Official's post.",
    time: "1 hr ago",
  },
  {
    id: "3",
    emoji: "🏟",
    title: "Slot confirmed",
    body: "Your night slot request for Shubhkamna Night Cup is confirmed.",
    time: "3 hrs ago",
  },
  {
    id: "4",
    emoji: "👥",
    title: "New follower",
    body: "Parth Shah started following you.",
    time: "Yesterday",
  },
  {
    id: "5",
    emoji: "👕",
    title: "Store offer",
    body: "Extra 20% off on top sellers. Use code CRIC20 at checkout.",
    time: "2 days ago",
  },
];


function NotificationsPanel({ visible, onClose, items, onMarkAllRead }) {
  const unread = items.filter((n) => !n.read).length;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.searchDim}>
        <View style={styles.searchBox}>
          <View style={styles.notifHead}>
            <Text style={styles.notifTitle}>Notifications</Text>
            <View style={styles.notifHeadRight}>
              {unread > 0 && (
                <TouchableOpacity hitSlop={8} onPress={onMarkAllRead}>
                  <Text style={styles.notifClear}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity hitSlop={8} onPress={onClose}>
                <Text style={styles.searchCancel}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.notifRow}>
                <View style={styles.notifEmojiWrap}>
                  <Text style={styles.notifEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.searchRowMid}>
                  <Text style={styles.searchRowTitle}>{item.title}</Text>
                  <Text style={styles.searchRowSub} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const FEED_STATUS = { LIVE: "Live", SCHEDULED: "Upcoming", COMPLETED: "Completed" };

function feedMatchToCard(m) {
  return {
    id: String(m.id),
    owner: m.venue || "Community",
    tournament: m.match_type || "Match",
    league: m.venue || "",
    status: FEED_STATUS[m.status] || "In review",
    meta: `${m.overs_limit || ""} Ov.${m.venue ? `  |  ${m.venue}` : ""}`,
    team1: m.team_a?.name || "Team A",
    score1: "-",
    overs1: "",
    team2: m.team_b?.name || "Team B",
    score2: "-",
    overs2: "",
    result: m.result_summary || "",
  };
}

function feedPlayerToCard(p, index) {
  return {
    id: String(p.id ?? index),
    name: p.full_name || "Cricketer",
    emoji: "🏏",
    runs: p.role ? String(p.role).replace("_", " ") : "",
    wkts: "",
  };
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("foryou");
  const [followed, setFollowed] = useState({});
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [feed, setFeed] = useState(null);

  // Real feed from backend; bundled mocks stay as fallback offline.
  useEffect(() => {
    let alive = true;
    getHomeFeed()
      .then((data) => {
        if (alive) setFeed(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const contactMatches = useMemo(() => {
    if (!feed) return CONTACT_MATCHES;
    const all = [
      ...(feed.live_matches || []),
      ...(feed.upcoming_matches || []),
      ...(feed.recent_results || []),
    ].map(feedMatchToCard);
    return all.length > 0 ? all : CONTACT_MATCHES;
  }, [feed]);

  const cricketers = useMemo(() => {
    if (!feed?.suggested_cricketers?.length) return CRICKETERS;
    return feed.suggested_cricketers.map(feedPlayerToCard);
  }, [feed]);

  const hasUnread = notifs.some((n) => !n.read);

  const openAppDrawer = () =>
    navigation?.dispatch?.(DrawerActions.openDrawer());

  const firstName =
    user?.full_name?.split(" ")?.[0] || user?.full_name || "Nishant Giri";
  const jerseyName = (user?.full_name || "NISHANT GIRI").toUpperCase();

  const toggleFollow = (id) =>
    setFollowed((p) => ({ ...p, [id]: !p[id] }));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header
        onMenu={openAppDrawer}
        onPro={() => navigation.navigate("ProBenefits")}
        onSearch={() => setSearchOpen(true)}
        onBell={() => setNotifOpen(true)}
        showBellDot={hasUnread}
        onInbox={() => navigation.navigate("DirectMessages")}
      />
      <TopTabs active={tab} onChange={setTab} />

      <SearchOverlay
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSeeMatch={() => {
          setTab("foryou");
          setShowAllMatches(true);
        }}
      />
      <NotificationsPanel
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifs}
        onMarkAllRead={() => setNotifs((p) => p.map((n) => ({ ...n, read: true })))}
      />

      {tab === "pro" ? (
        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <ClubFeed userName={firstName} />
          <AdBanner />
          <View style={{ height: 24 }} />
        </ScrollView>
      ) : showAllMatches ? (
        <AllMatchesView onBack={() => setShowAllMatches(false)} matches={contactMatches} />
      ) : (
        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <FollowPrompt name={firstName} />

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Matches of your contacts</Text>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => setShowAllMatches(true)}
            >
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={contactMatches}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchList}
            renderItem={({ item }) => <MatchCard item={item} />}
          />

          <HighlightsBanner />

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Popular cricketers</Text>
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.sectionLink}>Follow friends</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={cricketers}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playerList}
            renderItem={({ item }) => (
              <CricketerCard
                item={item}
                followed={!!followed[item.id]}
                onToggle={() => toggleFollow(item.id)}
              />
            )}
          />

          <Text style={styles.promoTitle}>
            {firstName}, get top sellers at an extra 20% off.
          </Text>
          <FlatList
            data={JERSEYS}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jerseyList}
            renderItem={({ item }) => (
              <JerseyCard item={item} userName={jerseyName} />
            )}
          />

          <AdBanner />
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  body: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* Header — Dream11-style dynamic red gradient (DreamHeader) + gold strip */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 13,
    shadowColor: "#A60E14",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoWrap: {
    marginLeft: 6,
  },
  logoBall: {
    fontSize: 30,
  },
  proBtn: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  proBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bellDot: {
    position: "absolute",
    top: 2,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },

  /* Tabs */
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: RED,
  },
  tabText: {
    fontSize: 17,
    color: "#333",
  },
  tabTextActive: {
    color: "#111",
    fontWeight: "600",
  },
  proPill: {
    backgroundColor: TEAL,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: "hidden",
  },
  proPillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  clubTab: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* Follow prompt */
  followRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  youCol: {
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  avatarEmoji: {
    fontSize: 44,
  },
  avatarPlus: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarPlusText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 18,
  },
  youText: {
    marginTop: 6,
    fontSize: 14,
    color: "#111",
  },
  bubble: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#777",
  },

  /* Sections */
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: GREY_BG,
    paddingVertical: 12,
    marginHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  sectionLink: {
    fontSize: 16,
    color: TEAL,
    fontWeight: "500",
  },

  /* Match cards */
  matchList: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  matchCard: {
    width: 330,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
    padding: 14,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  matchCardFull: {
    width: "auto",
    marginRight: 0,
    marginBottom: 12,
  },
  allWrap: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backArrow: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },
  backText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginLeft: 6,
  },
  chipsRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#111",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
  },
  chipTextActive: {
    color: "#fff",
  },
  allList: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  allEmpty: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginTop: 40,
  },
  matchHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F6F6F6",
    marginHorizontal: -14,
    marginTop: -14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  matchOwner: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  matchHeadIcon: {
    fontSize: 18,
  },
  tournamentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  tournamentText: {
    flex: 1,
    fontSize: 14,
    color: "#888",
    marginRight: 8,
  },
  tournamentBold: {
    fontWeight: "700",
    color: "#888",
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusReview: {
    backgroundColor: "#FBD38D",
  },
  statusLive: {
    backgroundColor: "#C6F6D5",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#744210",
  },
  matchMeta: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  scoreBlock: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    marginTop: 10,
    paddingVertical: 10,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginRight: 8,
  },
  teamNameDim: {
    fontWeight: "400",
    color: "#888",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  scoreTextDim: {
    fontWeight: "400",
    color: "#888",
  },
  oversText: {
    fontSize: 13,
    fontWeight: "400",
  },
  resultText: {
    fontSize: 15,
    color: "#333",
    marginTop: 10,
  },
  matchLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  matchLink: {
    fontSize: 15,
    color: TEAL,
    fontWeight: "500",
    marginHorizontal: 14,
  },

  /* Weekly highlights */
  hlBanner: {
    flexDirection: "row",
    marginTop: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  hlLeft: {
    flex: 1,
    paddingLeft: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  hlIntro: {
    fontSize: 16,
    color: "#111",
  },
  hlTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: RED,
    lineHeight: 30,
    marginTop: 2,
  },
  hlBtn: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  hlBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  hlRight: {
    flex: 1.4,
    flexDirection: "row",
    backgroundColor: RED,
    borderTopLeftRadius: 60,
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  hlCard: {
    flex: 1,
    backgroundColor: TEAL,
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    alignItems: "center",
    minHeight: 130,
  },
  hlAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  hlAvatarEmoji: {
    fontSize: 28,
  },
  hlCardName: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  hlCardTitle: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  hlCardSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 8,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 11,
  },

  /* Cricketers */
  playerList: {
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  playerCard: {
    width: 172,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  playerPhoto: {
    height: 190,
    backgroundColor: "#9DB89A",
    alignItems: "center",
    justifyContent: "center",
  },
  playerEmoji: {
    fontSize: 84,
  },
  playerShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    paddingVertical: 10,
    alignItems: "center",
  },
  playerName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  playerStats: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
  },
  followBtn: {
    backgroundColor: TEAL,
    paddingVertical: 12,
    alignItems: "center",
  },
  followBtnDone: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: TEAL,
  },
  followBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
  },
  followBtnTextDone: {
    color: TEAL,
  },

  /* Jersey promo */
  promoTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    paddingHorizontal: 14,
    marginTop: 18,
    marginBottom: 12,
  },
  jerseyList: {
    paddingHorizontal: 14,
  },
  jerseyCard: {
    width: 220,
    height: 250,
    backgroundColor: "#F4F4F4",
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  jerseyStage: {
    width: 200,
    height: 230,
    alignItems: "center",
    justifyContent: "center",
  },
  jerseyShirt: {
    width: 120,
    height: 150,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",
    paddingTop: 22,
  },
  jerseyBack: {
    position: "absolute",
    right: 8,
    top: 52,
    zIndex: 1,
  },
  jerseyFront: {
    position: "absolute",
    left: 8,
    top: 22,
    zIndex: 2,
    opacity: 0.98,
  },
  jerseyCollar: {
    position: "absolute",
    top: 6,
    width: 34,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  jerseyBadge: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    marginTop: 40,
  },
  jerseyName: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  jerseyNo: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 2,
  },

  /* Ad */
  adWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  adInfo: {
    fontSize: 16,
    color: "#9FC1E8",
    marginRight: 8,
  },
  adBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2A6B",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    maxWidth: 380,
  },
  adBrand: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  adBrandAccent: {
    color: "#FF9F1C",
  },
  adMid: {
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  adTitle: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  adCta: {
    backgroundColor: "#FF6B1A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 4,
  },
  adCtaText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  /* PRO tab */
  proEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  proEmptyEmoji: {
    fontSize: 56,
  },
  proEmptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginTop: 12,
  },
  proEmptySub: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  /* Club feed */
  clubWrap: {
    flex: 1,
    backgroundColor: "#fff",
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  composerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  composerHint: {
    fontSize: 16,
    color: "#777",
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 6,
    alignItems: "center",
  },
  filterLine: {
    color: TEAL,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 12,
  },
  filterLine1: {
    width: 26,
    textAlign: "center",
  },
  filterLine2: {
    width: 20,
    textAlign: "center",
  },
  filterLine3: {
    width: 12,
    textAlign: "center",
  },
  myOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginTop: 10,
  },
  myOnlyText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#777",
  },
  clearLink: {
    fontSize: 16,
    color: TEAL,
    fontWeight: "500",
  },
  clubList: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  clubCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  clubHead: {
    flexDirection: "row",
    alignItems: "center",
  },
  clubAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  clubAvatarEmoji: {
    fontSize: 20,
  },
  clubAuthor: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  clubTime: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#999",
  },
  clubText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#222",
    marginTop: 10,
  },
  posterBox: {
    backgroundColor: "#9A3412",
    borderRadius: 10,
    marginTop: 12,
    padding: 16,
    alignItems: "center",
  },
  posterOrg: {
    color: "#FFD23F",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  posterBig: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 32,
  },
  posterMeta: {
    color: "#FFE9A8",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
  posterCta: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
  },
  clubActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  clubAction: {
    marginRight: 26,
  },
  clubActionIcon: {
    fontSize: 22,
    color: "#444",
  },
  clubActionLiked: {
    color: RED,
  },
  clubStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  clubStatsText: {
    fontSize: 13,
    color: "#888",
  },
  clubComment: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  clubCommentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  clubCommentText: {
    fontSize: 14,
    color: "#111",
  },
  clubCommentName: {
    fontWeight: "600",
  },
  clubCommentBadge: {
    color: "#777",
  },
  clubEmpty: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 90,
    paddingBottom: 120,
  },
  clubEmptyLogo: {
    fontSize: 30,
    color: "#333",
  },
  clubEmptyLogoRed: {
    color: RED,
    fontWeight: "900",
  },
  clubEmptyLogoPro: {
    fontSize: 10,
    color: "#fff",
    backgroundColor: TEAL,
    fontWeight: "800",
  },
  clubEmptyText: {
    fontSize: 17,
    color: "#111",
    textAlign: "center",
    marginTop: 18,
    lineHeight: 24,
  },
  modalDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    minHeight: 240,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 12,
    minHeight: 110,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
    textAlignVertical: "top",
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
  },
  modalCancel: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 15,
    color: "#777",
    fontWeight: "600",
  },
  modalPost: {
    backgroundColor: RED,
    borderRadius: 8,
    paddingHorizontal: 26,
    paddingVertical: 10,
  },
  modalPostText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  /* Search + notifications */
  searchDim: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
  },
  searchBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: "85%",
    minHeight: 320,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 24,
    color: "#fff",
    marginRight: 8,
    fontWeight:"bold"
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    paddingVertical: 12,
  },
  searchCancel: {
    fontSize: 18,
    color: "#777",
    fontWeight: "600",
    padding: 4,
  },
  searchHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  searchGroup: {
    fontSize: 13,
    fontWeight: "800",
    color: "#999",
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  searchRowEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  searchRowMid: {
    flex: 1,
  },
  searchRowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  searchRowSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  searchRowArrow: {
    fontSize: 22,
    color: "#BBB",
    marginLeft: 8,
  },
  notifHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  notifTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  notifHeadRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifClear: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "600",
    marginRight: 14,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  notifEmojiWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  notifEmoji: {
    fontSize: 22,
  },
  notifTime: {
    fontSize: 12,
    color: "#AAA",
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RED,
    marginLeft: 8,
    marginTop: 6,
  },
  unused: {
    display: "none",
  },
});

export { RED, RED_DARK, TEAL };
