import messaging from "@react-native-firebase/messaging";

/**
 * Requires android/app/google-services.json and ios/GoogleService-Info.plist
 * to be dropped into the native projects (see README "Mobile setup") before
 * this does anything useful. Safe to import either way — every call is
 * wrapped so a missing/misconfigured Firebase project degrades to a no-op
 * instead of crashing the app.
 */

export async function requestNotificationPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.warn("Notification permission request failed:", error.message);
    return false;
  }
}

export async function getDeviceToken() {
  try {
    return await messaging().getToken();
  } catch (error) {
    console.warn("Unable to fetch FCM device token:", error.message);
    return null;
  }
}

export function onForegroundMessage(handler) {
  return messaging().onMessage(handler);
}

export function onNotificationOpenedApp(handler) {
  return messaging().onNotificationOpenedApp(handler);
}
