import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const NAVY = "#E01A22";
const RED = "#E63329";
const ORANGE = "#EA580C";

const INTRO_MS = 2400;

export default function IntroScreen({ onDone }) {
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOp = useRef(new Animated.Value(0)).current;
  const line1 = useRef(new Animated.Value(0)).current;
  const line2 = useRef(new Animated.Value(0)).current;
  const line3 = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(34)).current;
  const textOp = useRef(new Animated.Value(0)).current;
  const tagOp = useRef(new Animated.Value(0)).current;
  const ballBounce = useRef(new Animated.Value(-60)).current;
  const outOp = useRef(new Animated.Value(1)).current;
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(outOp, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => onDone?.());
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(logoOp, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(140, [
        Animated.timing(line1, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(line2, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(line3, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(textY, {
            toValue: 0,
            duration: 550,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(textOp, {
            toValue: 1,
            duration: 550,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(900),
        Animated.parallel([
          Animated.timing(tagOp, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(ballBounce, {
            toValue: 0,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    const t = setTimeout(finish, INTRO_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lineW = (a, max) =>
    a.interpolate({ inputRange: [0, 1], outputRange: [0, max] });

  return (
    <TouchableWithoutFeedback onPress={finish}>
      <Animated.View style={[styles.wrap, { opacity: outOp }]}>
        <View style={styles.lines}>
          <Animated.View style={[styles.line, styles.l1, { width: lineW(line1, 190) }]} />
          <Animated.View style={[styles.line, styles.l2, { width: lineW(line2, 150) }]} />
          <Animated.View style={[styles.line, styles.l3, { width: lineW(line3, 110) }]} />
        </View>

        <Animated.View
          style={[
            styles.logoBox,
            { opacity: logoOp, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={require("../../../assets/app-logo.png")}
            style={styles.logo}
            resizeMode="cover"
          />
          <Animated.View style={{ transform: [{ translateY: ballBounce }] }}>
            <Text style={styles.ball}>🔴</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={{ opacity: textOp, transform: [{ translateY: textY }] }}
        >
          <Text style={styles.cricket}>CRICKET</Text>
          <Text style={styles.state}>STATE</Text>
        </Animated.View>

        <Animated.View style={[styles.tag, { opacity: tagOp }]}>
          <Text style={styles.tagText}>🏏  LIVE SCORE   |   🔴  LIVE STREAMING</Text>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  lines: {
    position: "absolute",
    top: 120,
    left: 0,
    height: 90,
    justifyContent: "space-between",
  },
  line: {
    height: 8,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  l1: {
    backgroundColor: RED,
  },
  l2: {
    backgroundColor: ORANGE,
  },
  l3: {
    backgroundColor: "#fff",
    opacity: 0.85,
  },
  logoBox: {
    alignItems: "center",
  },
  logo: {
    width: 168,
    height: 168,
    borderRadius: 38,
  },
  ball: {
    fontSize: 34,
    marginTop: -18,
  },
  cricket: {
    color: "#fff",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 4,
    marginTop: 18,
    textAlign: "center",
  },
  state: {
    color: RED,
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 6,
    textAlign: "center",
    marginTop: -6,
  },
  tag: {
    marginTop: 22,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  tagText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
