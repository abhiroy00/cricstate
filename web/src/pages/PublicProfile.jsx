import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import FollowButton from "../components/common/FollowButton";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../services/api";
import { fetchFollowers, fetchFollowing, fetchProfile } from "../services/profileService";

export default function PublicProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);
  const [tab, setTab] = useState("followers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [profileData, followersData, followingData] = await Promise.all([
        fetchProfile(userId),
        fetchFollowers(userId),
        fetchFollowing(userId),
      ]);
      setProfile(profileData);
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) {
    return <Loader label="Loading profile..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (!profile) {
    return <EmptyState message="Profile not found" />;
  }

  const isOwnProfile = currentUser?.id === profile.user_id;
  const activeList = tab === "followers" ? followers : following;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>{profile.full_name}</h1>
        <p className="profile-username">@{profile.username}</p>
        <div className="profile-stats">
          <span>
            <strong>{profile.followers_count}</strong> Followers
          </span>
          <span>
            <strong>{profile.following_count}</strong> Following
          </span>
        </div>
        {!isOwnProfile && (
          <FollowButton
            userId={profile.user_id}
            initialIsFollowing={profile.is_following}
            onChange={load}
          />
        )}
      </div>

      <p>{profile.bio || "No bio yet."}</p>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${tab === "followers" ? "active" : ""}`}
          onClick={() => setTab("followers")}
        >
          Followers ({followers.total})
        </button>
        <button
          className={`profile-tab ${tab === "following" ? "active" : ""}`}
          onClick={() => setTab("following")}
        >
          Following ({following.total})
        </button>
      </div>

      {activeList.items.length === 0 ? (
        <EmptyState message={`No ${tab} yet`} />
      ) : (
        <ul className="profile-user-list">
          {activeList.items.map((item) => (
            <li key={item.id}>
              <Link to={`/users/${item.id}`}>{item.full_name}</Link>
              <span className="profile-user-username">@{item.username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
