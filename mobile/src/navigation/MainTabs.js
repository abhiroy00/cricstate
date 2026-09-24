import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CommunityStack from "./CommunityStack";
import HomeStack from "./HomeStack";
import LookingStack from "./LookingStack";
import StoreStack from "./StoreStack";
import MyCricketStack from "./MyCricketStack";

const Tab = createBottomTabNavigator();

const RED = "#D71920";
const INK = "#1A1A1A";

/* Sab icons fixed-size box ke andar, normal flow me —
   box ke bahar kuch nahi nikalta, isliye label se overlap nahi hoga. */

function HomeIcon({ color }) {
  return (
    <View style={tb.iconBox}>
      <View style={tb.homeRoof}>
        <View style={[tb.homeRoofL, { backgroundColor: color }]} />
        <View style={[tb.homeRoofR, { backgroundColor: color }]} />
      </View>
      <View style={[tb.homeBox, { borderColor: color }]}>
        <View style={[tb.homeDot, { borderColor: color }]} />
      </View>
    </View>
  );
}

function LookingIcon({ color }) {
  return (
    <View style={tb.iconBox}>
      <View style={tb.lookTop}>
        <View style={[tb.lookLens, { borderColor: color }]} />
        <View style={[tb.lookBridge, { backgroundColor: color }]} />
        <View style={[tb.lookLens, { borderColor: color }]} />
      </View>
      <View style={tb.lookLegs}>
        <View style={[tb.lookLeg, { backgroundColor: color }]} />
        <View style={[tb.lookLeg, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function BatIcon({ color }) {
  return (
    <View style={tb.iconBox}>
      <View style={tb.batRow}>
        <View style={[tb.batBall, { borderColor: color }]} />
        <View style={tb.batGroup}>
          <View style={[tb.batHandle, { borderColor: color }]} />
          <View style={[tb.batBlade, { borderColor: color }]} />
        </View>
      </View>
    </View>
  );
}

function CommunityIcon({ color }) {
  return (
    <View style={tb.iconBox}>
      <View style={tb.comTop}>
        <View style={[tb.comHeadSm, { borderColor: color }]} />
        <View style={[tb.comHead, { borderColor: color }]} />
        <View style={[tb.comHeadSm, { borderColor: color }]} />
      </View>
      <View style={tb.comBot}>
        <View style={[tb.comShSm, { borderColor: color }]} />
        <View style={[tb.comSh, { borderColor: color }]} />
        <View style={[tb.comShSm, { borderColor: color }]} />
      </View>
    </View>
  );
}

function StoreIcon({ color }) {
  return (
    <View style={tb.iconBox}>
      <View style={[tb.storeHandle, { borderColor: color }]} />
      <View style={[tb.storeBag, { borderColor: color }]} />
    </View>
  );
}

const ICONS = {
  Home: HomeIcon,
  Looking: LookingIcon,
  "My Cricket": BatIcon,
  Community: CommunityIcon,
  Store: StoreIcon,
};

export default function MainTabs() {
  // Edge-to-edge Android par system nav (≡ ○ <) tab bar ke upar na chadhe,
  // isliye bottom inset ka padding + height me joda gaya hai.
  const insets = useSafeAreaInsets();
  const barStyle = [
    styles.bar,
    { height: 64 + insets.bottom, paddingBottom: 8 + insets.bottom },
  ];
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: RED,
        tabBarInactiveTintColor: INK,
        tabBarStyle: barStyle,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ color }) => {
          const C = ICONS[route.name];
          return C ? <C color={color} /> : null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Looking" component={LookingStack} />
      <Tab.Screen name="My Cricket" component={MyCricketStack} />
      <Tab.Screen
        name="Community"
        component={CommunityStack}
        options={({ route }) => {
          // Andar ki screens (Scorers/Umpires/List) par tab bar hide,
          // taaki View all/Register bar bilkul neeche rahe — screenshot jaisa.
          const focused = getFocusedRouteNameFromRoute(route) ?? "CommunityHome";
          return focused === "CommunityHome"
            ? {}
            : { tabBarStyle: { display: "none" } };
        }}
      />
      <Tab.Screen name="Store" component={StoreStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EDEDED",
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: 3,
  },
});

const tb = StyleSheet.create({
  iconBox: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  /* Home — house + dot */
  homeRoof: {
    width: 26,
    height: 12,
  },
  homeRoofL: {
    position: "absolute",
    left: 0,
    top: 5,
    width: 15,
    height: 2.6,
    borderRadius: 2,
    transform: [{ rotate: "-38deg" }],
  },
  homeRoofR: {
    position: "absolute",
    right: 0,
    top: 5,
    width: 15,
    height: 2.6,
    borderRadius: 2,
    transform: [{ rotate: "38deg" }],
  },
  homeBox: {
    width: 20,
    height: 13,
    borderWidth: 2.4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: 2.5,
  },
  homeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    borderWidth: 1.6,
  },
  /* Looking — binoculars */
  lookTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  lookLens: {
    width: 12,
    height: 15,
    borderRadius: 6,
    borderWidth: 2.4,
  },
  lookBridge: {
    width: 6,
    height: 2.4,
    marginTop: 3,
  },
  lookLegs: {
    width: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 3,
    marginTop: 2,
  },
  lookLeg: {
    width: 2.4,
    height: 5,
    borderRadius: 1,
  },
  /* My Cricket — ball + bat */
  batRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  batBall: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 2,
  },
  batGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 2,
    transform: [{ rotate: "-38deg" }],
  },
  batHandle: {
    width: 8,
    height: 4.5,
    borderWidth: 2,
    borderRadius: 3,
  },
  batBlade: {
    width: 15,
    height: 7,
    borderWidth: 2.2,
    borderRadius: 4,
    marginLeft: -2,
  },
  /* Community — group of 3 */
  comTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  comHead: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2.2,
  },
  comHeadSm: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  comBot: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
    gap: 1,
  },
  comSh: {
    width: 16,
    height: 8,
    borderWidth: 2.2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  comShSm: {
    width: 10,
    height: 6,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  /* Store — bag */
  storeHandle: {
    width: 12,
    height: 8,
    borderWidth: 2.4,
    borderBottomWidth: 0,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  storeBag: {
    width: 22,
    height: 15,
    borderWidth: 2.4,
    borderRadius: 2,
    marginTop: -1,
  },
});
