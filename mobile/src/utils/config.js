// Lightweight config constants. For per-environment builds, swap this for
// react-native-config and read from a real .env — kept as plain constants here
// to avoid pulling in another native module for Phase 1.

// Points at the deployed production backend rather than a local dev URL -
// a physical phone running Expo Go isn't guaranteed to share a network with
// the machine running the dev server, but the public EC2 box is reachable
// from anywhere. Switch back to a LAN/emulator URL for local-only testing.
export const API_BASE_URL = "http://100.61.50.136/api/v1";
