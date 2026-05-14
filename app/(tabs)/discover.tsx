import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@/constants/ThemeContext";
import { FONTS } from "@/constants/fonts";

const COMMUNITIES = [
  { id: '1', icon: 'laptop-outline', lib: 'ion', name: 'Tech Lovers', members: 1240, color: '#4CAF50' },
  { id: '2', icon: 'musical-notes', lib: 'ion', name: 'Music Vibes', members: 890, color: '#9C27B0' },
  { id: '3', icon: 'airplane', lib: 'ion', name: 'Travel Bugs', members: 2100, color: '#2196F3' },
  { id: '4', icon: 'pizza', lib: 'ion', name: 'Foodies', members: 1560, color: '#FF5722' },
  { id: '5', icon: 'book', lib: 'ion', name: 'Book Club', members: 430, color: '#795548' },
  { id: '6', icon: 'game-controller', lib: 'ion', name: 'Gamers', members: 980, color: '#607D8B' },
  { id: '7', icon: 'barbell', lib: 'ion', name: 'Fitness', members: 720, color: '#F44336' },
  { id: '8', icon: 'color-palette', lib: 'ion', name: 'Artists', members: 560, color: '#FF9800' },
];

const MODES = [
  { id: 'dating', icon: 'heart', lib: 'ion', label: 'Dating', color: '#FF2D7A' },
  { id: 'friends', icon: 'people', lib: 'ion', label: 'Friends', color: '#4FC3F7' },
  { id: 'networking', icon: 'briefcase', lib: 'ion', label: 'Network', color: '#FFD700' },
];

const EVENTS = [
  { title: 'Weekend Hiking Trip', community: 'Travel Bugs', members: 24, icon: 'trail-sign', color: '#2196F3' },
  { title: 'Coffee & Code Meetup', community: 'Tech Lovers', members: 18, icon: 'cafe', color: '#4CAF50' },
  { title: 'Open Mic Night', community: 'Music Vibes', members: 35, icon: 'mic', color: '#9C27B0' },
];

function GlossIcon({ icon, color, size = 26 }: any) {
  return <Ionicons name={icon as any} size={size} color={color} />;
}

export default function Discover() {
  const { colors, isDark } = useTheme();
  const [selectedMode, setSelectedMode] = useState('dating');
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);

  const toggleJoin = (id: string) => {
    setJoinedCommunities(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background, flex: 1 }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={{ paddingHorizontal: 16, gap: 20 }}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSub, { color: colors.subtext, fontFamily: FONTS.medium }]}>EXPLORE</Text>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Discover</Text>
          </View>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Mode Selector */}
        <View style={[styles.modeSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
              <Ionicons name="options" size={14} color="#FF2D7A" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>
              What are you here for?
            </Text>
          </View>
          <View style={styles.modeRow}>
            {MODES.map((mode) => {
              const isActive = selectedMode === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeChip,
                    { borderColor: isActive ? mode.color : colors.border, backgroundColor: isActive ? `${mode.color}22` : colors.background },
                  ]}
                  onPress={() => setSelectedMode(mode.id)}
                >
                  <View style={[styles.modeIconWrap, { backgroundColor: isActive ? `${mode.color}33` : 'rgba(255,255,255,0.05)' }]}>
                    <GlossIcon icon={mode.icon} color={isActive ? mode.color : colors.subtext} size={18} />
                  </View>
                  <Text style={[styles.modeLabel, { color: isActive ? mode.color : colors.subtext, fontFamily: FONTS.semibold }]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Communities */}
        <View style={{ gap: 12 }}>
          <View style={styles.sectionHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(79,195,247,0.15)' }]}>
              <Ionicons name="people" size={14} color="#4FC3F7" />
            </View>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Interest Communities</Text>
              <Text style={[styles.subTitle, { color: colors.subtext, fontFamily: FONTS.regular }]}>Meet people with same interests</Text>
            </View>
          </View>

          <View style={styles.communitiesGrid}>
            {COMMUNITIES.map((community) => {
              const isJoined = joinedCommunities.includes(community.id);
              return (
                <View key={community.id} style={[styles.communityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.communityIconWrap, { backgroundColor: `${community.color}22` }]}>
                    <GlossIcon icon={community.icon} color={community.color} size={28} />
                  </View>
                  <Text style={[styles.communityName, { color: colors.text, fontFamily: FONTS.bold }]}>
                    {community.name}
                  </Text>
                  <Text style={[styles.communityMembers, { color: colors.subtext, fontFamily: FONTS.regular }]}>
                    {community.members.toLocaleString()} members
                  </Text>
                  <TouchableOpacity
                    style={[styles.joinBtn, { backgroundColor: isJoined ? colors.border : community.color }]}
                    onPress={() => toggleJoin(community.id)}
                  >
                    {isJoined
                      ? <Ionicons name="checkmark" size={14} color={colors.text} />
                      : null}
                    <Text style={[styles.joinText, { color: isJoined ? colors.text : 'white', fontFamily: FONTS.semibold }]}>
                      {isJoined ? 'Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Trending Events */}
        <View style={{ gap: 12 }}>
          <View style={styles.sectionHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(255,107,0,0.15)' }]}>
              <Ionicons name="flame" size={14} color="#FF6B00" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Trending Near You</Text>
          </View>

          {EVENTS.map((event, i) => (
            <TouchableOpacity key={i} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.eventIconWrap, { backgroundColor: `${event.color}22` }]}>
                <GlossIcon icon={event.icon} color={event.color} size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: colors.text, fontFamily: FONTS.semibold }]}>{event.title}</Text>
                <Text style={[styles.eventCommunity, { color: colors.subtext, fontFamily: FONTS.regular }]}>
                  {event.community} • {event.members} going
                </Text>
              </View>
              <TouchableOpacity style={styles.rsvpBtn}>
                <Text style={[styles.rsvpText, { fontFamily: FONTS.bold }]}>RSVP</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
  headerSub: { fontSize: 11, letterSpacing: 1.5 },
  headerTitle: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  headerBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  subTitle: { fontSize: 12, marginTop: 2 },
  glossIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modeSection: { borderRadius: 20, padding: 16, gap: 12, borderWidth: 1 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5 },
  modeIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modeLabel: { fontSize: 12, fontWeight: '600' },
  communitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  communityCard: { width: '47%', borderRadius: 18, padding: 14, alignItems: 'center', gap: 8, borderWidth: 1 },
  communityIconWrap: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  communityName: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  communityMembers: { fontSize: 11, textAlign: 'center' },
  joinBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 20, paddingVertical: 7, borderRadius: 20 },
  joinText: { fontSize: 13, fontWeight: '600' },
  eventCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, gap: 12, borderWidth: 1 },
  eventIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 14, fontWeight: '600' },
  eventCommunity: { fontSize: 12, marginTop: 2 },
  rsvpBtn: { backgroundColor: '#FF2D7A', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  rsvpText: { color: 'white', fontSize: 12, fontWeight: '700' },
});