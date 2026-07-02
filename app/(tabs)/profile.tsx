import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Alert, TextInput, Modal, Image, ImageBackground } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth, db } from "@/constants/appwrite";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useTheme } from "@/constants/ThemeContext";
import { FONTS } from "@/constants/fonts";

const ACHIEVEMENTS = [
  { id: 'first_match', icon: 'heart', title: 'First Match!', desc: 'Got your first match', unlocked: true, color: '#FF2D7A' },
  { id: 'streak_3', icon: 'flame', title: '3 Day Streak', desc: 'Chat 3 days in a row', unlocked: true, color: '#FF6B00' },
  { id: 'streak_7', icon: 'flash', title: 'Week Warrior', desc: 'Chat 7 days in a row', unlocked: false, color: '#FFD700' },
  { id: 'profile_complete', icon: 'star', title: 'Profile Star', desc: 'Complete your profile', unlocked: true, color: '#FFD700' },
  { id: 'super_match', icon: 'trophy', title: 'Super Match', desc: 'Get 90%+ compatibility', unlocked: false, color: '#FFD700' },
  { id: 'social', icon: 'people', title: 'Social Butterfly', desc: 'Match with 5 people', unlocked: false, color: '#4FC3F7' },
];

const FEATURED_PROFILES = [
  { id: '1', name: 'Maya', age: 24, role: 'Designer', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: '2', name: 'Alex', age: 27, role: 'Photographer', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: '3', name: 'Priya', age: 23, role: 'Developer', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export default function Profile() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const [incognito, setIncognito] = useState(false);
  const [blurPhoto, setBlurPhoto] = useState(false);
  const [profileScore, setProfileScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userIntent, setUserIntent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAge, setEditAge] = useState('');

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      setUserName(data.name || '');
      setUserBio(data.bio || '');
      setUserAge(data.age?.toString() || '');
      setUserIntent(data.intent || '');
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
    router.replace('/auth/signin');
  };

  const handleSaveProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid), {
      name: editName,
      bio: editBio,
      age: parseInt(editAge) || 0,
    });
    setUserName(editName);
    setUserBio(editBio);
    setUserAge(editAge);
    setShowEditProfile(false);
    Alert.alert('✅ Profile updated!', 'Your profile has been saved.');
    loadUserData();
  };

  const openEditProfile = () => {
    setEditName(userName);
    setEditBio(userBio);
    setEditAge(userAge);
    setShowEditProfile(true);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background, flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

      {/* Hero Banner */}
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800' }}
        style={styles.heroBanner}
      >
        <View style={styles.heroOverlay}>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.heroTitle, { fontFamily: FONTS.bold }]}>NEXT{'\n'}GEN</Text>
            <Text style={[styles.heroSub, { fontFamily: FONTS.medium }]}>DATING APP</Text>
          </View>
          {/* Settings buttons on hero */}
          <View style={styles.heroButtons}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card }]} onPress={toggleTheme}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={isDark ? '#FFD700' : '#A78BFA'} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card }]} onPress={() => setShowSettings(true)}>
              <Ionicons name="settings-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <View style={{ gap: 16, padding: 16 }}>

        {/* Next Gen Features */}
        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Next Gen Features</Text>
          <View style={styles.featuresRow}>
            <TouchableOpacity style={[styles.featureBtn, { backgroundColor: 'rgba(255,45,122,0.15)', borderColor: '#FF2D7A' }]} onPress={() => router.push('/datediary')}>
              <Ionicons name="book" size={18} color="#FF2D7A" />
              <Text style={[styles.featureBtnText, { color: '#FF2D7A', fontFamily: FONTS.semibold }]}>Date Diary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.featureBtn, { backgroundColor: 'rgba(79,195,247,0.15)', borderColor: '#4FC3F7' }]} onPress={() => router.push('/videodating')}>
              <Ionicons name="sparkles" size={18} color="#4FC3F7" />
              <Text style={[styles.featureBtnText, { color: '#4FC3F7', fontFamily: FONTS.semibold }]}>Speed Date</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.featureBtn, { backgroundColor: 'rgba(255,107,0,0.15)', borderColor: '#FF6B00' }]} onPress={() => router.push('/storyprofile')}>
              <Ionicons name="person" size={18} color="#FF6B00" />
              <Text style={[styles.featureBtnText, { color: '#FF6B00', fontFamily: FONTS.semibold }]}>Story</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Profiles */}
        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Featured Profiles</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {FEATURED_PROFILES.map((profile) => (
              <TouchableOpacity key={profile.id} style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/people')}>
                <Image source={{ uri: profile.image }} style={styles.profileAvatar} />
                <Text style={[styles.profileName, { color: colors.text, fontFamily: FONTS.bold }]}>{profile.name}, {profile.age}</Text>
                <Text style={[styles.profileRole, { color: colors.subtext, fontFamily: FONTS.regular }]}>{profile.role}</Text>
                <View style={styles.verifiedRow}>
                  <Ionicons name="shield-checkmark" size={12} color="#4ade80" />
                  <Text style={[styles.verifiedText, { fontFamily: FONTS.medium }]}>Verified Profile</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Matching Suggestions */}
        <View style={[styles.matchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.matchTitle, { color: colors.text, fontFamily: FONTS.bold }]}>
            You have 3 new matching suggestions!
          </Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(tabs)/people')}>
            <Text style={[styles.exploreBtnText, { fontFamily: FONTS.bold }]}>EXPLORE 3 NEW MATCHES</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
                <Ionicons name="person" size={40} color="#FF2D7A" />
              </View>
              <TouchableOpacity style={styles.avatarEditBtn} onPress={() => Alert.alert('📸 Add Photo', 'Photo upload coming soon!')}>
                <Ionicons name="camera" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.userName, { color: colors.text, fontFamily: FONTS.bold }]}>{userName || 'Your Name'}</Text>
              {userAge ? <Text style={[styles.userAge, { color: colors.subtext, fontFamily: FONTS.regular }]}>Age: {userAge}</Text> : null}
              {userBio
                ? <Text style={[styles.userBio, { color: colors.subtext, fontFamily: FONTS.regular }]} numberOfLines={2}>{userBio}</Text>
                : <Text style={[styles.userBio, { color: colors.subtext, fontFamily: FONTS.regular }]}>No bio yet — add one!</Text>
              }
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#4ade80" />
                <Text style={[styles.verifiedText, { fontFamily: FONTS.medium }]}>Verified Profile</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtnSmall} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={16} color="#fff" />
              <Text style={[styles.logoutSmallText, { fontFamily: FONTS.semibold }]}>Logout</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.editProfileBtn, { borderColor: '#FF2D7A' }]} onPress={openEditProfile}>
            <Ionicons name="pencil" size={16} color="#FF2D7A" />
            <Text style={[styles.editProfileText, { fontFamily: FONTS.semibold }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Progress */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Profile Progress</Text>
            <Text style={[styles.progressPercent, { fontFamily: FONTS.bold }]}>{profileScore}% completed</Text>
          </View>
          <View style={[styles.progressBarOuter, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarInner, { width: `${profileScore}%` as any }]} />
          </View>
          {[
            { label: 'Basic Information', icon: 'person-outline', done: !!userName, onPress: openEditProfile },
            { label: 'Add Bio', icon: 'document-text-outline', done: !!userBio, onPress: openEditProfile },
            { label: 'Add Photo', icon: 'camera-outline', done: false, onPress: () => Alert.alert('📸', 'Photo upload coming soon!') },
            { label: 'Set Intent', icon: 'heart-outline', done: !!userIntent, onPress: () => router.push('/auth/onboarding') },
            { label: 'Verify Identity', icon: 'shield-checkmark-outline', done: true, onPress: () => router.push('/VerificationScreen') },
          ].map((section, i) => (
            <TouchableOpacity key={i} style={styles.progressSection} onPress={section.onPress}>
              <View style={[styles.progressSectionIcon, { backgroundColor: section.done ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)' }]}>
                <Ionicons name={section.icon as any} size={16} color={section.done ? '#4ade80' : colors.subtext} />
              </View>
              <Text style={[styles.progressSectionText, { color: section.done ? colors.text : colors.subtext, fontFamily: FONTS.regular }]}>
                {section.label}
              </Text>
              {section.done
                ? <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
                : <Ionicons name="add-circle-outline" size={18} color="#FF2D7A" />
              }
            </TouchableOpacity>
          ))}
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
              <View key={a.id} style={[styles.achievementCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }, !a.unlocked && styles.achievementLocked]}>
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
            <Switch value={incognito} onValueChange={setIncognito} trackColor={{ false: colors.border, true: '#FF2D7A' }} thumbColor="#fff" />
          </View>
          <View style={styles.privacyRow}>
            <View style={[styles.privacyIconWrap, { backgroundColor: 'rgba(79,195,247,0.15)' }]}>
              <Ionicons name="eye" size={18} color="#4FC3F7" />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={[styles.privacyLabel, { color: colors.text, fontFamily: FONTS.semibold }]}>Blur My Photo</Text>
              <Text style={[styles.privacyDesc, { color: colors.subtext, fontFamily: FONTS.regular }]}>Show blurred photo until match</Text>
            </View>
            <Switch value={blurPhoto} onValueChange={setBlurPhoto} trackColor={{ false: colors.border, true: '#FF2D7A' }} thumbColor="#fff" />
          </View>
        </View>

      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.inputLabel, { color: colors.subtext, fontFamily: FONTS.medium }]}>Full Name</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={18} color="#FF2D7A" />
              <TextInput style={[styles.input, { color: colors.text, fontFamily: FONTS.regular }]} placeholder="Your name" placeholderTextColor={colors.subtext} value={editName} onChangeText={setEditName} />
            </View>
            <Text style={[styles.inputLabel, { color: colors.subtext, fontFamily: FONTS.medium }]}>Age</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="calendar-outline" size={18} color="#FF2D7A" />
              <TextInput style={[styles.input, { color: colors.text, fontFamily: FONTS.regular }]} placeholder="Your age" placeholderTextColor={colors.subtext} value={editAge} onChangeText={setEditAge} keyboardType="numeric" />
            </View>
            <Text style={[styles.inputLabel, { color: colors.subtext, fontFamily: FONTS.medium }]}>Bio</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Ionicons name="document-text-outline" size={18} color="#FF2D7A" style={{ marginTop: 2 }} />
              <TextInput style={[styles.input, { color: colors.text, fontFamily: FONTS.regular, minHeight: 80, textAlignVertical: 'top' }]} placeholder="Tell people about yourself..." placeholderTextColor={colors.subtext} value={editBio} onChangeText={setEditBio} multiline />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Text style={[styles.saveBtnText, { fontFamily: FONTS.bold }]}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {[
              { icon: 'notifications-outline', label: 'Notifications', color: '#FF6B00', action: () => Alert.alert('Notifications', 'Coming soon! 🔔') },
              { icon: 'shield-outline', label: 'Privacy & Safety', color: '#4FC3F7', action: () => Alert.alert('Privacy', 'Coming soon!') },
              { icon: 'help-circle-outline', label: 'Help & Support', color: '#4ade80', action: () => Alert.alert('Help', 'Email: support@nextgendating.com') },
              { icon: 'information-circle-outline', label: 'About App', color: '#A78BFA', action: () => Alert.alert('NextGen Dating', 'Version 1.0.0 ❤️') },
              { icon: 'star-outline', label: 'Rate the App', color: '#FFD700', action: () => Alert.alert('Rate Us! ⭐', 'Thank you!') },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={[styles.settingsItem, { borderBottomColor: colors.border }]} onPress={item.action}>
                <View style={[styles.settingsIconWrap, { backgroundColor: `${item.color}22` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text, fontFamily: FONTS.medium }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.logoutBtnFull} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={[styles.logoutBtnText, { fontFamily: FONTS.bold }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroBanner: { height: 200 },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: 16, paddingBottom: 20 },
  heroTextWrap: { gap: 2 },
  heroTitle: { fontSize: 36, fontWeight: '900', color: '#fff', lineHeight: 40 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', letterSpacing: 3 },
  heroButtons: { flexDirection: 'row', gap: 8, alignSelf: 'flex-start', marginTop: 40 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  featuresRow: { flexDirection: 'row', gap: 8 },
  featureBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  featureBtnText: { fontSize: 12, fontWeight: '600' },
  profileCard: { width: 150, borderRadius: 20, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 4 },
  profileName: { fontSize: 15, fontWeight: '700' },
  profileRole: { fontSize: 12 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 11, color: '#4ade80' },
  matchCard: { borderRadius: 20, padding: 20, alignItems: 'center', gap: 16, borderWidth: 1 },
  matchTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  exploreBtn: { backgroundColor: '#FF2D7A', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, width: '100%', alignItems: 'center', shadowColor: '#FF2D7A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  exploreBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  profileInfoCard: { borderRadius: 20, padding: 16, borderWidth: 1, gap: 14 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  avatarEditBtn: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF2D7A', alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 18, fontWeight: '700' },
  userAge: { fontSize: 12 },
  userBio: { fontSize: 12, lineHeight: 16 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoutBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ff4444', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16 },
  logoutSmallText: { color: '#fff', fontSize: 12 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  editProfileText: { color: '#FF2D7A', fontSize: 14 },
  section: { borderRadius: 20, padding: 16, gap: 12, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  glossIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressPercent: { fontSize: 14, color: '#FFD700' },
  progressBarOuter: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarInner: { height: 8, borderRadius: 4, backgroundColor: '#FFD700' },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  progressSectionIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  progressSectionText: { flex: 1, fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 26, fontWeight: '800', color: '#FF2D7A' },
  statLabel: { fontSize: 12 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 14, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  inputLabel: { fontSize: 12, letterSpacing: 0.5, marginBottom: -8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15 },
  saveBtn: { backgroundColor: '#FF2D7A', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  settingsItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 0.5 },
  settingsIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { flex: 1, fontSize: 15 },
  logoutBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ff4444', paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  logoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});