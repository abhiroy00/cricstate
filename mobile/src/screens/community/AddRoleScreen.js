import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "./roleData";

const RED = "#EA580C";
const TEAL = "#0FA3A3";

const ROLE_EMOJI = {
  scorers: "📋",
  umpires: "🧢",
  commentators: "🎙️",
};

export default function AddRoleScreen({ navigation, route }) {
  const { user } = useAuth();
  const roleKey = route?.params?.role || "scorers";
  const role = ROLES[roleKey] || ROLES.scorers;

  const [name, setName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("New Bongaigaon Railway Colony");
  const [feeMatch, setFeeMatch] = useState("");
  const [feeDay, setFeeDay] = useState("");
  const [exp, setExp] = useState("");

  const publish = () => {
    navigation.navigate("RoleBoard", {
      role: roleKey,
      newEntry: {
        name: name.trim() || "New Member",
        matches: 0,
        points: 0,
        feeDay: feeDay ? `₹${feeDay}/day` : "₹-/day",
        feeMatch: feeMatch ? `${feeMatch}/match` : "-/match",
        emoji: ROLE_EMOJI[roleKey] || "🧑🏽",
        bg: "#E8EEF7",
        city,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={12}
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{role.addTitle}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.photoWrap} activeOpacity={0.8}>
          <View style={styles.photoCircle}>
            <Text style={styles.photoIcon}>{ROLE_EMOJI[roleKey]}</Text>
            <View style={styles.camBadge}>
              <Text style={styles.camText}>📷</Text>
            </View>
          </View>
          <Text style={styles.addPhoto}>Add photo</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>
              {role.title.slice(0, -1)} name<Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.inputActive]}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#B5B5B5"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              {role.title.slice(0, -1)} contact number<Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="8851888818"
              placeholderTextColor="#B5B5B5"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              City<Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#B5B5B5"
            />
          </View>

          <View style={styles.feesRow}>
            <View style={styles.feesHalf}>
              <Text style={styles.label}>
                Fees<Text style={styles.star}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={feeMatch}
                onChangeText={setFeeMatch}
                keyboardType="numeric"
                placeholderTextColor="#B5B5B5"
              />
            </View>
            <Text style={styles.feesMid}>Per match (20 ov.)</Text>
            <View style={styles.feesHalf}>
              <Text style={styles.label}>
                Fees<Text style={styles.star}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={feeDay}
                onChangeText={setFeeDay}
                keyboardType="numeric"
                placeholderTextColor="#B5B5B5"
              />
            </View>
            <Text style={styles.feesMid}>per day</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Total {role.title.slice(0, -1).toLowerCase()}ing experience
              (approx)
            </Text>
            <View style={styles.expRow}>
              <TextInput
                style={styles.expBox}
                value={exp}
                onChangeText={setExp}
                keyboardType="numeric"
              />
              <Text style={styles.yrs}>yrs</Text>
            </View>
          </View>
          <View style={{ height: 16 }} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.8}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.publishBtn}
          activeOpacity={0.85}
          onPress={publish}
        >
          <Text style={styles.publishText}>Publish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 6,
  },
  backArrow: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  photoWrap: {
    alignItems: "center",
    paddingVertical: 26,
  },
  photoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  photoIcon: {
    fontSize: 64,
  },
  camBadge: {
    position: "absolute",
    right: 2,
    bottom: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  camText: {
    fontSize: 20,
  },
  addPhoto: {
    color: RED,
    fontSize: 17,
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 16,
  },
  field: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    color: "#777",
  },
  star: {
    color: "#777",
    fontSize: 13,
  },
  input: {
    fontSize: 19,
    color: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#D5D5D5",
    paddingVertical: 6,
    marginTop: 2,
  },
  inputActive: {
    borderBottomWidth: 2,
    borderBottomColor: TEAL,
  },
  feesRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 16,
  },
  feesHalf: {
    width: 80,
  },
  feesMid: {
    fontSize: 16,
    color: "#9A9A9A",
    marginLeft: 8,
    marginRight: 18,
    paddingBottom: 8,
  },
  expRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  expBox: {
    width: 110,
    height: 62,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 4,
    fontSize: 18,
    color: "#111",
    textAlign: "center",
  },
  yrs: {
    fontSize: 17,
    fontStyle: "italic",
    color: "#888",
    marginLeft: 12,
  },
  footer: {
    flexDirection: "row",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 18,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 19,
    color: "#888",
  },
  publishBtn: {
    flex: 1,
    backgroundColor: TEAL,
    paddingVertical: 18,
    alignItems: "center",
  },
  publishText: {
    fontSize: 19,
    color: "#fff",
  },
});
