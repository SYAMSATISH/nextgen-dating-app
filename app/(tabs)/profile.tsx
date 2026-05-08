import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import Button from "@/components/Button";
import Avatar from "@/components/Avatar";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth, db } from "@/constants/appwrite";
import { updatePrivacySettings } from "@/DB/userDB";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "@/constants/ThemeContext";

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

const ACHIEVEMENTS = [
  { id: 'first_match', icon: '💕', title: 'First Match!', desc: 'Got your first match', unlocked: true },
  { id: 'streak_3', icon: '🔥', title: '3 Day Streak', desc: 'Chat 3 days in a row', unlocked: true },
  { id: 'streak_7', icon: '⚡', title: 'Week Warrior', desc: 'Chat 7 days in a row', unlocked: false },
  { id: 'profile_complete', icon: '⭐', title: 'Profile Star', desc: 'Complete your profile', unlocked: true },
  { id: 'super_match', icon: '🏆', title: 'Super Match', desc: 'Get 90%+ compatibility', unlocked: false },
  { id: 'social', icon: '👥', title: 'Social Butterfly', desc: 'Match with 5 people', unlocked: false },
];

const profile = () => {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const [incognito, setIncognito] = useState(false);
  const [blurPhoto, setBlurPhoto] = useState(false);
  const [profileScore, setProfileScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('Profile');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      setUserName(data.name || 'Profile');
      setIncognito(data.incognito || false);
      setBlurPhoto(data.blurPhoto || false);
      setStreak(data.streak || 0);
      let score = 0;
      if (data.name) score += 20;
      if (data.bio) score += 20;
      if (data.photo) score += 20;
      if (data.intent) score += 20;
      if (data.age) score += 20;
      setProfileScore(score);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/signin");
  };

  const handleIncognito = async (value: boolean) => {
    setIncognito(value);
    const uid = auth.currentUser?.uid;
    if (uid) await updatePrivacySettings(uid, { incognito: value });
    if (value) Alert.alert('Incognito Mode', 'You are now invisible to other users!');
  };

  const handleBlurPhoto = async (value: boolean) => {
    setBlurPhoto(value);
    const uid = auth.currentUser?.uid;
    if (uid) await updatePrivacySettings(uid, { blurPhoto: value });
  };

  const handleScreenshotAlert = () => {
    Alert.alert('📸 Screenshot Detected!', 'Please respect others privacy.', [{ text: 'OK' }]);
  };

  const headerbutton = () => <AntDesign name="setting" size={24} color="black" />;

  return (
    <ScrollView style={{ paddingHorizontal: 8, backgroundColor: colors.background }}>
      <View style={{ gap: 12 }}>
        <Header headerTitle={"Profile"} button={headerbutton} />

        {/* Avatar + Name + Logout */}
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Avatar size={80} image="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400" />
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 22, fontWeight: "600", color: colors.text }}>{userName}</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gamification */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Your Stats</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={styles.statNumber}>{profileScore}%</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Profile Score</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${profileScore}%` as any }]} />
              </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={styles.statNumber}>🔥 {streak}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Day Streak</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>🎯 Achievements</Text>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, !achievement.unlocked && styles.achievementLocked]}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
                <Text style={styles.achievementDesc}>{achievement.desc}</Text>
                {!achievement.unlocked && <Text style={styles.lockedText}>🔒 Locked</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🔒 Privacy Settings</Text>
          <View style={styles.privacyRow}>
            <View style={styles.privacyInfo}>
              <Text style={[styles.privacyLabel, { color: colors.text }]}>🕵️ Incognito Mode</Text>
              <Text style={[styles.privacyDesc, { color: colors.subtext }]}>Hide your profile from others</Text>
            </View>
            <Switch value={incognito} onValueChange={handleIncognito} trackColor={{ false: '#E0E0E0', true: '#E91E63' }} />
          </View>
          <View style={styles.privacyRow}>
            <View style={styles.privacyInfo}>
              <Text style={[styles.privacyLabel, { color: colors.text }]}>🌫️ Blur My Photo</Text>
              <Text style={[styles.privacyDesc, { color: colors.subtext }]}>Show blurred photo until match</Text>
            </View>
            <Switch value={blurPhoto} onValueChange={handleBlurPhoto} trackColor={{ false: '#E0E0E0', true: '#E91E63' }} />
          </View>
          <TouchableOpacity style={styles.screenshotBtn} onPress={handleScreenshotAlert}>
            <Text style={styles.screenshotText}>📸 Test Screenshot Alert</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎨 Theme</Text>
          <View style={styles.privacyRow}>
            <View style={styles.privacyInfo}>
              <Text style={[styles.privacyLabel, { color: colors.text }]}>
                {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </Text>
              <Text style={[styles.privacyDesc, { color: colors.subtext }]}>Switch app theme</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E0E0E0', true: '#E91E63' }}
            />
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
            <Text style={[styles.row1, { fontWeight: "bold", color: colors.text }]}>What you get:</Text>
            <Text style={[styles.row2, { fontWeight: "bold", color: colors.text }]}>Premium+</Text>
            <Text style={[styles.row3, { fontWeight: "bold", color: colors.text }]}>Premium</Text>
          </View>
          {PLANS.map((planitem) => (
            <View style={styles.tableItem} key={planitem.plan}>
              <Text style={[styles.row1, { fontWeight: "300", color: colors.subtext }]}>{planitem.plan}</Text>
              <Ionicons style={styles.row2} name="checkmark-outline" size={24} color={planitem.p1 ? colors.primary : "#bdb9b9"} />
              <Ionicons style={styles.row3} name="checkmark-outline" size={24} color={planitem.p2 ? colors.primary : "#bdb9b9"} />
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
  section: { borderRadius: 16, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#E91E63' },
  statLabel: { fontSize: 12 },
  progressBar: { width: '100%', height: 6, backgroundColor: '#333', borderRadius: 3, marginTop: 4 },
  progressFill: { height: 6, backgroundColor: '#E91E63', borderRadius: 3 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achievementCard: { width: '30%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, alignItems: 'center', gap: 2 },
  achievementLocked: { opacity: 0.5 },
  achievementIcon: { fontSize: 24 },
  achievementTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  achievementDesc: { fontSize: 9, color: '#888', textAlign: 'center' },
  lockedText: { fontSize: 9, color: '#E91E63', marginTop: 2 },
  privacyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  privacyInfo: { flex: 1 },
  privacyLabel: { fontSize: 15, fontWeight: '600' },
  privacyDesc: { fontSize: 12, marginTop: 2 },
  screenshotBtn: { backgroundColor: '#E91E63', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  screenshotText: { color: 'white', fontWeight: '600', fontSize: 14 },
  premiumCard: { backgroundColor: "#ffa600", height: 160, width: 300, borderRadius: 20, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, gap: 10 },
  tableItem: { flexDirection: "row", paddingHorizontal: 5, borderBottomWidth: 2, paddingVertical: 5, borderColor: "#333" },
  row1: { width: "40%" },
  row2: { width: "30%", justifyContent: "center", alignItems: "center" },
  row3: { width: "30%", justifyContent: "center", alignItems: "center", alignSelf: "center" },
  table: { width: "100%", gap: 4 },
  circle: { borderRadius: 40, height: 40, width: 40, backgroundColor: "#ffa600", justifyContent: "center", alignItems: "center" },
});