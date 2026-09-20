export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MATCH_ADMIN",
  "STREAMING_ADMIN",
  "CONTENT_ADMIN",
  "COMMUNITY_ADMIN",
  "STORE_ADMIN",
  "FINANCE_ADMIN",
  "SUPPORT_ADMIN",
];

export function hasAdminAccess(user) {
  if (!user || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.some((role) => ADMIN_ROLES.includes(role));
}
