import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Alert } from "react-native";
import React, { useState } from "react";
import Header from "@/components/Header";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import Button from "@/components/Button";
import Avatar from "@/components/Avatar";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "@/constants/appwrite";
import { updatePrivacySettings } from "@/DB/userDB";

const PLANS = [
  { plan: "Get exclusive photo insights", p1: true, p2: true },
  { plan: "Fast track your likes", p1: true, p2: true },
  { plan: "Standout every day", p1: true, p2: true },
  { plan: "Unlimited likes", p1: true, p2: false },
  { plan: "See who liked you", p1: true, p2: false },
  { plan: "Advanced filters", p1: true, p2: false },
  { plan: "Incognito mode", p1: true, p2: false },
  { plan: "Two compliments a week", p1: true, p2: true },
];

const profile = () => {
  const router = useRouter();
  const [incognito, setIncognito] = useState(false);
  const [blurPhoto, setBlurPhoto] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/signin");
  };

  const handleIncognito = async (value: boolean) => {
    setIncognito(value);
    const uid = auth.currentUser?.uid;
    if (uid) {
      await updatePrivacySettings(uid, { incognito: value });
    }
    if (value) {
      Alert.alert('Incognito Mode', 'You are now invisible to other users!');
    }
  };

  const handleBlurPhoto = async (value: boolean) => {
    setBlurPhoto(value);
    const uid = auth.currentUser?.uid;
    if (uid) {
      await updatePrivacySettings(uid, { blurPhoto: value });
    }
  };

  const handleScreenshotAlert = () => {
    Alert.alert(
      '📸 Screenshot Detected!',
      'Please respect other users privacy. Screenshots are not allowed in chats.',
      [{ text: 'OK' }]
    );
  };

  const headerbutton = () => <AntDesign name="setting" size={24} color="black" />;

  return (
    <ScrollView style={{ paddingHorizontal: 8 }}>
      <View style={{ gap: 10 }}>
        <Header headerTitle={"Profile"} button={headerbutton} />

        {/* Avatar + Logout */}
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Avatar
            size={80}
            image="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400"
          />
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 22, fontWeight: "600" }}>Profile</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.privacySection}>
          <Text style={styles.sectionTitle}>🔒 Privacy Settings</Text>

          {/* Incognito Mode */}
          <View style={styles.privacyRow}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>🕵️ Incognito Mode</Text>
              <Text style={styles.privacyDesc}>Hide your profile from others</Text>
            </View>
            <Switch
              value={incognito}
              onValueChange={handleIncognito}
              trackColor={{ false: '#E0E0E0', true: '#E91E63' }}
              thumbColor={incognito ? '#fff' : '#fff'}
            />
          </View>

          {/* Blur Photo */}
          <View style={styles.privacyRow}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>🌫️ Blur My Photo</Text>
              <Text style={styles.privacyDesc}>Show blurred photo until match</Text>
            </View>
            <Switch
              value={blurPhoto}
              onValueChange={handleBlurPhoto}
              trackColor={{ false: '#E0E0E0', true: '#E91E63' }}
              thumbColor={blurPhoto ? '#fff' : '#fff'}
            />
          </View>

          {/* Screenshot Alert Test */}
          <TouchableOpacity style={styles.screenshotBtn} onPress={handleScreenshotAlert}>
            <Text style={styles.screenshotText}>📸 Test Screenshot Alert</Text>
          </TouchableOpacity>
        </View>

        {/* Spotlight */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={styles.spotlightCard}>
            <View style={styles.circle}><AntDesign name="star" size={24} color="black" /></View>
            <View><Text style={{ fontWeight: "800", color: "white" }}>Spotlight</Text><Text>Stand out</Text></View>
          </View>
          <View style={styles.spotlightCard}>
            <View style={styles.circle}><AntDesign name="star" size={24} color="black" /></View>
            <View><Text style={{ fontWeight: "800", color: "white" }}>Spotlight</Text><Text>Stand out</Text></View>
          </View>
        </View>

        {/* Premium Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.premiumCard, { marginRight: 5 }]}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Premium+</Text>
            <Text style={{ fontWeight: "300", textAlign: "center" }}>Get the VIP treatment</Text>
            <Button style={{ backgroundColor: "#1c1c1c" }} textStyle={{ color: "#ebebeb" }} onPress={() => {}}>Upgrade Now</Button>
          </View>
          <View style={styles.premiumCard}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Premium</Text>
            <Text style={{ fontWeight: "300", textAlign: "center" }}>Get the VIP treatment</Text>
            <Button style={{ backgroundColor: "#1c1c1c" }} textStyle={{ color: "#ebebeb" }} onPress={() => {}}>Upgrade Now</Button>
          </View>
        </ScrollView>

        {/* Plans Table */}
        <View style={styles.table}>
          <View style={styles.tableItem}>
            <Text style={[styles.row1, { fontWeight: "bold" }]}>What you get:</Text>
            <Text style={[styles.row2, { fontWeight: "bold" }]}>Premium+</Text>
            <Text style={[styles.row3, { fontWeight: "bold" }]}>Premium</Text>
          </View>
          {PLANS.map((planitem) => (
            <View style={styles.tableItem} key={planitem.plan}>
              <Text style={[styles.row1, { fontWeight: "300", color: "white" }]}>{planitem.plan}</Text>
              <Ionicons style={styles.row2} name="checkmark-outline" size={24} color={planitem.p1 ? "black" : "#bdb9b9"} />
              <Ionicons style={styles.row3} name="checkmark-outline" size={24} color={planitem.p2 ? "black" : "#bdb9b9"} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default profile;

const styles = StyleSheet.create({
  logoutButton: { backgroundColor: "#ff4444", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: "center" },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 16 },
  privacySection: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: 'white', marginBottom: 4 },
  privacyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  privacyInfo: { flex: 1 },
  privacyLabel: { fontSize: 15, fontWeight: '600', color: 'white' },
  privacyDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  screenshotBtn: { backgroundColor: '#E91E63', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  screenshotText: { color: 'white', fontWeight: '600', fontSize: 14 },
  spotlightCard: { flexDirection: "row", gap: 5, flex: 1, borderWidth: 1, paddingHorizontal: 3, paddingVertical: 10, borderRadius: 12, borderColor: "#f0eded" },
  premiumCard: { backgroundColor: "#ffa600", height: 160, width: 300, borderRadius: 20, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, gap: 10 },
  tableItem: { flexDirection: "row", paddingHorizontal: 5, borderBottomWidth: 2, paddingVertical: 5, borderColor: "#f0eded" },
  row1: { width: "40%" },
  row2: { width: "30%", justifyContent: "center", alignItems: "center" },
  row3: { width: "30%", justifyContent: "center", alignItems: "center", alignSelf: "center" },
  table: { width: "100%", gap: 4 },
  circle: { borderRadius: 40, height: 40, width: 40, backgroundColor: "#ffa600", justifyContent: "center", alignItems: "center" },
});