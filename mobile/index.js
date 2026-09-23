import "react-native-gesture-handler";

import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent("main", ...)
// under the hood - the fixed name Expo Go's runtime expects, regardless of
// this project's own app name (which now only lives under app.json's
// "expo" key, per Expo's config schema).
registerRootComponent(App);
