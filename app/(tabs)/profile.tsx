import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth, db } from "@/constants/appwrite";
import { updatePrivacySettings } from "@/DB/userDB";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "@/constants/ThemeContext";
import { FONTS } from "@/constants/fonts";

const PLANS = [
  { plan: "Exclusive photo insights", p1: true, p2: true },
  { plan: "Fast track your likes", p1: true, p2: true },
  { plan: "Standout every day", p1: true, p2: true },
  { plan: "Unlimited likes", p1: true, p2: false },
  { plan: "See who liked you", p1: true, p2: false },
  { plan: "Advanced filters", p1: true, p2: false },
  { plan: "Incognito mode", p1: true, p2: false },
  { plan: "Two compliments a week", p1: true, p2: true },
];

const ACHIEVEMENTS = [
  { id: 'first_match', icon: 'heart', title: 'First Match!', desc: 'Got your first match', unlocked: true, color: '#FF2D7A' },
  { id: 'streak_3', icon: 'flame', title: '3 Day Streak', desc: 'Chat 3 days in a row', unlocked: true, color: '#FF6B00' },
  { id: 'streak_7', icon: 'flash', title: 'Week Warrior', desc: 'Chat 7 days in a row', unlocked: false, color: '#FFD700' },
  { id: 'profile_complete', icon: 'star', title: 'Profile Star', desc: 'Complete your profile', unlocked: true, color: '#FFD700' },
  { id: 'super_match', icon: 'trophy', title: 'Super Match', desc: 'Get 90%+ compatibility', unlocked: false, color: '#FFD700' },
  { id: 'social', icon: 'people', title: 'Social Butterfly', desc: 'Match with 5 people', unlocked: false, color: '#4FC3F7' },
];

export default function Profile() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const [incognito, setIncognito] = useState(false);
  const [blurPhoto, setBlurPhoto] = useState(false);
  const [profileScore, setProfileScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('Profile');

  useEffect(() => { loadUserData(); }, []);

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

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={{ gap: 16, padding: 20 }}>

        {/* Header — theme icon top right corner lo */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSub, { color: colors.subtext, fontFamily: FONTS.medium }]}>MY ACCOUNT</Text>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Profile</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Theme toggle icon */}
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={20}
                color={isDark ? '#FFD700' : '#A78BFA'}
              />
            </TouchableOpacity>
            {/* Settings icon */}
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="settings-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar Row */}
        <View style={[styles.avatarRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Avatar size={72} image="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400" />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[styles.userName, { color: colors.text, fontFamily: FONTS.bold }]}>{userName}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#4ade80" />
              <Text style={[styles.verifiedText, { fontFamily: FONTS.medium }]}>Verified Profile</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={[styles.logoutText, { fontFamily: FONTS.semibold }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(255,215,0,0.15)' }]}>
              <Ionicons name="trophy" size={16} color="#FFD700" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Your Stats</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
              <Text style={[styles.statNumber, { fontFamily: FONTS.bold }]}>{profileScore}%</Text>
              <Text style={[styles.statLabel, { color: colors.subtext, fontFamily: FONTS.regular }]}>Profile Score</Text>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${profileScore}%` as any }]} />
              </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="flame" size={24} color="#FF6B00" />
                <Text style={[styles.statNumber, { fontFamily: FONTS.bold }]}>{streak}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.subtext, fontFamily: FONTS.regular }]}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
              <Ionicons name="ribbon" size={16} color="#FF2D7A" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Achievements</Text>
          </View>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((a) => (
              <View key={a.id} style={[
                styles.achievementCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
                !a.unlocked && styles.achievementLocked
              ]}>
                <View style={[styles.achieveIconWrap, { backgroundColor: `${a.color}22` }]}>
                  <Ionicons name={a.icon as any} size={24} color={a.unlocked ? a.color : '#555'} />
                </View>
                <Text style={[styles.achievementTitle, { color: colors.text, fontFamily: FONTS.semibold }]}>{a.title}</Text>
                <Text style={[styles.achievementDesc, { fontFamily: FONTS.regular }]}>{a.desc}</Text>
                {!a.unlocked && (
                  <View style={styles.lockedWrap}>
                    <Ionicons name="lock-closed" size={10} color="#FF2D7A" />
                    <Text style={[styles.lockedText, { fontFamily: FONTS.medium }]}>Locked</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Privacy */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(79,195,247,0.15)' }]}>
              <Ionicons name="lock-closed" size={16} color="#4FC3F7" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Privacy Settings</Text>
          </View>

          <View style={styles.privacyRow}>
            <View style={[styles.privacyIconWrap, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
              <Ionicons name="eye-off" size={18} color="#FF2D7A" />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={[styles.privacyLabel, { color: colors.text, fontFamily: FONTS.semibold }]}>Incognito Mode</Text>
              <Text style={[styles.privacyDesc, { color: colors.subtext, fontFamily: FONTS.regular }]}>Hide your profile from others</Text>
            </View>
            <Switch value={incognito} onValueChange={handleIncognito} trackColor={{ false: colors.border, true: '#FF2D7A' }} thumbColor="#fff" />
          </View>

          <View style={styles.privacyRow}>
            <View style={[styles.privacyIconWrap, { backgroundColor: 'rgba(79,195,247,0.15)' }]}>
              <Ionicons name="eye" size={18} color="#4FC3F7" />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={[styles.privacyLabel, { color: colors.text, fontFamily: FONTS.semibold }]}>Blur My Photo</Text>
              <Text style={[styles.privacyDesc, { color: colors.subtext, fontFamily: FONTS.regular }]}>Show blurred photo until match</Text>
            </View>
            <Switch value={blurPhoto} onValueChange={handleBlurPhoto} trackColor={{ false: colors.border, true: '#FF2D7A' }} thumbColor="#fff" />
          </View>

          <TouchableOpacity style={styles.screenshotBtn} onPress={() => Alert.alert('Screenshot Detected!', 'Please respect others privacy.')}>
            <Ionicons name="camera" size={18} color="#fff" />
            <Text style={[styles.screenshotText, { fontFamily: FONTS.bold }]}>Test Screenshot Alert</Text>
          </TouchableOpacity>
        </View>

        {/* Premium */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[{ title: 'Premium+', sub: 'Get the VIP treatment' }, { title: 'Premium', sub: 'Get the VIP treatment' }].map((plan) => (
            <View key={plan.title} style={[styles.premiumCard, { marginRight: 12 }]}>
              <View style={styles.premiumIconWrap}>
                <Ionicons name="diamond" size={28} color="#fff" />
              </View>
              <Text style={[styles.premiumTitle, { fontFamily: FONTS.bold }]}>{plan.title}</Text>
              <Text style={[styles.premiumSub, { fontFamily: FONTS.regular }]}>{plan.sub}</Text>
              <TouchableOpacity style={styles.upgradeBtn}>
                <Text style={[styles.upgradeText, { fontFamily: FONTS.bold }]}>Upgrade Now</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Plans Table */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.row1, styles.tableHeaderText, { color: colors.subtext, fontFamily: FONTS.bold }]}>What you get:</Text>
            <Text style={[styles.row2, styles.tableHeaderText, { color: colors.subtext, fontFamily: FONTS.bold }]}>Premium+</Text>
            <Text style={[styles.row3, styles.tableHeaderText, { color: colors.subtext, fontFamily: FONTS.bold }]}>Premium</Text>
          </View>
          {PLANS.map((p) => (
            <View style={[styles.tableItem, { borderBottomColor: colors.border }]} key={p.plan}>
              <Text style={[styles.planText, { color: colors.subtext, fontFamily: FONTS.regular }]}>{p.plan}</Text>
              <View style={styles.row2}>
                <Ionicons name="checkmark-circle" size={20} color={p.p1 ? '#FF2D7A' : colors.border} />
              </View>
              <View style={styles.row3}>
                <Ionicons name="checkmark-circle" size={20} color={p.p2 ? '#FF2D7A' : colors.border} />
              </View>
            </View>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 4 },
  headerSub: { fontSize: 11, letterSpacing: 1.5 },
  headerTitle: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, borderWidth: 1 },
  userName: { fontSize: 20, fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 12, color: '#4ade80' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ff4444', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  logoutText: { color: '#fff', fontSize: 13 },
  section: { borderRadius: 20, padding: 16, gap: 12, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  glossIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 26, fontWeight: '800', color: '#FF2D7A' },
  statLabel: { fontSize: 12 },
  progressBar: { width: '100%', height: 5, borderRadius: 3, marginTop: 6 },
  progressFill: { height: 5, backgroundColor: '#FF2D7A', borderRadius: 3 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achievementCard: { width: '30%', borderRadius: 14, padding: 10, alignItems: 'center', gap: 4 },
  achievementLocked: { opacity: 0.4 },
  achieveIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  achievementTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  achievementDesc: { fontSize: 9, color: '#888', textAlign: 'center' },
  lockedWrap: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  lockedText: { fontSize: 9, color: '#FF2D7A' },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  privacyIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  privacyInfo: { flex: 1 },
  privacyLabel: { fontSize: 14, fontWeight: '600' },
  privacyDesc: { fontSize: 12, marginTop: 2 },
  screenshotBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF2D7A', padding: 14, borderRadius: 14, marginTop: 4 },
  screenshotText: { color: '#fff', fontSize: 14 },
  premiumCard: { backgroundColor: '#FF6B00', width: 260, borderRadius: 24, padding: 20, alignItems: 'center', gap: 8 },
  premiumIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  premiumTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  premiumSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  upgradeBtn: { backgroundColor: '#1a1a1a', paddingVertical: 10, paddingHorizontal: 28, borderRadius: 20, marginTop: 4 },
  upgradeText: { color: '#fff', fontSize: 14 },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  tableHeaderText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  tableItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  planText: { width: '40%', fontSize: 13 },
  row1: { width: '40%' },
  row2: { width: '30%', alignItems: 'center' },
  row3: { width: '30%', alignItems: 'center' },
});