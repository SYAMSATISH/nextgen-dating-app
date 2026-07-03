import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/ThemeContext";
import { FONTS } from "@/constants/fonts";

const FEATURED_PROFILES = [
  { name: 'Maya', age: 24, profession: 'Designer', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Alex', age: 27, profession: 'Photographer', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Priya', age: 23, profession: 'Developer', image: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export default function Home() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 120 }}>

      {/* ✅ Top Banner */}
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800' }}
        style={styles.banner}
        imageStyle={{ opacity: 0.7 }}
      >
        <View style={styles.bannerOverlay}>
          <View style={styles.bannerTopRow}>
            <View>
              <Text style={[styles.bannerTitle, { fontFamily: FONTS.bold }]}>NEXT{'\n'}GEN</Text>
              <Text style={[styles.bannerSub, { fontFamily: FONTS.medium }]}>DATING APP</Text>
            </View>
            <View style={styles.bannerIcons}>
              <TouchableOpacity style={styles.bannerIconBtn}>
                <Ionicons name="sunny" size={20} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bannerIconBtn}>
                <Ionicons name="settings-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={{ padding: 20, gap: 24 }}>

        {/* ✅ Next Gen Features */}
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Next Gen Features</Text>
          <View style={styles.featuresRow}>
            <TouchableOpacity
              style={[styles.featureBtn, { backgroundColor: 'rgba(139,0,0,0.6)', borderColor: '#FF2D7A' }]}
              onPress={() => router.push('/datediary')}
            >
              <Ionicons name="book" size={18} color="#FF2D7A" />
              <Text style={[styles.featureBtnText, { color: '#FF2D7A', fontFamily: FONTS.semibold }]}>Date Diary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.featureBtn, { backgroundColor: 'rgba(0,50,80,0.6)', borderColor: '#4FC3F7' }]}
              onPress={() => router.push('../videodating')}
            >
              <Ionicons name="sparkles" size={18} color="#4FC3F7" />
              <Text style={[styles.featureBtnText, { color: '#4FC3F7', fontFamily: FONTS.semibold }]}>Speed Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.featureBtn, { backgroundColor: 'rgba(80,30,0,0.6)', borderColor: '#FF6B00' }]}
              onPress={() => router.push('/storyprofile')}
            >
              <Ionicons name="person" size={18} color="#FF6B00" />
              <Text style={[styles.featureBtnText, { color: '#FF6B00', fontFamily: FONTS.semibold }]}>Story</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ Featured Profiles */}
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Featured Profiles</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.profilesRow}>
              {FEATURED_PROFILES.map((profile, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push('/(tabs)/people')}
                >
                  <Image source={{ uri: profile.image }} style={styles.profileImage} />
                  <Text style={[styles.profileName, { color: colors.text, fontFamily: FONTS.bold }]}>
                    {profile.name}, {profile.age}
                  </Text>
                  <Text style={[styles.profileProfession, { color: colors.subtext, fontFamily: FONTS.regular }]}>
                    {profile.profession}
                  </Text>
                  <View style={styles.verifiedRow}>
                    <Ionicons name="shield-checkmark" size={14} color="#4ade80" />
                    <Text style={[styles.verifiedText, { fontFamily: FONTS.medium }]}>Verified Profile</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ✅ Matching Suggestions Banner */}
        <View style={[styles.matchBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.matchBannerTitle, { color: colors.text, fontFamily: FONTS.bold }]}>
            You have 3 new matching suggestions! 🎉
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)/people')}
          >
            <Text style={[styles.exploreBtnText, { fontFamily: FONTS.bold }]}>EXPLORE 3 NEW MATCHES</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 220, justifyContent: 'flex-end' },
  bannerOverlay: { padding: 20, paddingBottom: 24 },
  bannerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bannerTitle: { fontSize: 36, fontWeight: '900', color: '#fff', lineHeight: 40 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: 3, marginTop: 4 },
  bannerIcons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  bannerIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  featuresRow: { flexDirection: 'row', gap: 10 },
  featureBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  featureBtnText: { fontSize: 13 },
  profilesRow: { flexDirection: 'row', gap: 12 },
  profileCard: { width: 160, borderRadius: 16, padding: 14, alignItems: 'center', gap: 8, borderWidth: 1 },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 4 },
  profileName: { fontSize: 16, fontWeight: '700' },
  profileProfession: { fontSize: 13 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 12, color: '#4ade80' },
  matchBanner: { borderRadius: 20, padding: 20, alignItems: 'center', gap: 16, borderWidth: 1 },
  matchBannerTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  exploreBtn: { backgroundColor: '#FF2D7A', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, width: '100%', alignItems: 'center' },
  exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
});