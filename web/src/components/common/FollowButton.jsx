import { useState } from "react";

import { followUser, unfollowUser } from "../../services/profileService";
import Button from "./Button";

export default function FollowButton({ userId, initialIsFollowing, onChange }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        onChange?.(false);
      } else {
        await followUser(userId);
        setIsFollowing(true);
        onChange?.(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={isFollowing ? "secondary" : "primary"} loading={loading} onClick={handleClick}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
