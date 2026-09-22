import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import { extractErrorMessage } from "../services/api";
import { fetchMyProfile, updateMyProfile } from "../services/profileService";

const EDITABLE_FIELDS = ["bio", "city", "country", "website_url"];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      setForm({
        bio: data.bio || "",
        city: data.city || "",
        country: data.country || "",
        website_url: data.website_url || "",
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loader label="Loading your profile..." />;
  }

  if (error && !profile) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (!profile) {
    return <EmptyState message="Profile not found" />;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>{profile.full_name}</h1>
        <p className="profile-username">@{profile.username}</p>
        <div className="profile-stats">
          <Link to={`/users/${profile.user_id}`}>
            <strong>{profile.followers_count}</strong> Followers
          </Link>
          <Link to={`/users/${profile.user_id}`}>
            <strong>{profile.following_count}</strong> Following
          </Link>
        </div>
      </div>

      {error && <p className="form-error-banner">{error}</p>}

      {!editing ? (
        <div className="profile-view">
          <p>{profile.bio || "No bio yet."}</p>
          <dl className="profile-fields">
            <dt>City</dt>
            <dd>{profile.city || "—"}</dd>
            <dt>Country</dt>
            <dd>{profile.country || "—"}</dd>
            <dt>Website</dt>
            <dd>{profile.website_url || "—"}</dd>
          </dl>
          <Button onClick={() => setEditing(true)}>Edit profile</Button>
        </div>
      ) : (
        <form className="profile-edit-form" onSubmit={handleSave}>
          <Input
            id="bio"
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <Input
            id="city"
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Input
            id="country"
            label="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
          <Input
            id="website_url"
            label="Website"
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
          />
          <div className="profile-edit-actions">
            <Button type="submit" loading={saving}>
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
