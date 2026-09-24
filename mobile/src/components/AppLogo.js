import { Image, StyleSheet, View } from "react-native";

export default function AppLogo({ size = 32 }) {
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={require("../../assets/app-logo.png")}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginLeft: 6,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
});
