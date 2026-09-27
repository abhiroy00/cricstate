import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "cricstate_access_token";
const REFRESH_TOKEN_KEY = "cricstate_refresh_token";

// In-memory cache so per-request auth doesn't hit AsyncStorage every time.
// `loaded` distinguishes "not read from disk yet" (undefined) from a genuine
// empty value (null), which matters for the hot request path.
let cachedAccessToken = null;
let cachedRefreshToken = null;
let loaded = false;

// Returns the cached access token, or `undefined` if the cache isn't primed.
export function getCachedAccessToken() {
  return loaded ? cachedAccessToken : undefined;
}

async function prime() {
  const entries = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  cachedAccessToken = entries[0][1];
  cachedRefreshToken = entries[1][1];
  loaded = true;
}

export async function getAccessToken() {
  if (!loaded) {
    await prime();
  }
  return cachedAccessToken;
}

export async function getRefreshToken() {
  if (!loaded) {
    await prime();
  }
  return cachedRefreshToken;
}

export async function setTokens({ accessToken, refreshToken }) {
  cachedAccessToken = accessToken;
  cachedRefreshToken = refreshToken;
  loaded = true;
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
}

export async function clearTokens() {
  cachedAccessToken = null;
  cachedRefreshToken = null;
  loaded = true;
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}
