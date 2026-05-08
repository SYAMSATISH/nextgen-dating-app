import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import Header from "@/components/Header";
import { EvilIcons } from "@expo/vector-icons";
import { useTheme } from "@/constants/ThemeContext";

const COMMUNITIES = [
  { id: '1', icon: '💻', name: 'Tech Lovers', members: 1240, color: '#4CAF50' },
  { id: '2', icon: '🎵', name: 'Music Vibes', members: 890, color: '#9C27B0' },
  { id: '3', icon: '✈️', name: 'Travel Bugs', members: 2100, color: '#2196F3' },
  { id: '4', icon: '🍕', name: 'Foodies', members: 1560, color: '#FF5722' },
  { id: '5', icon: '📚', name: 'Book Club', members: 430, color: '#795548' },
  { id: '6', icon: '🎮', name: 'Gamers', members: 980, color: '#607D8B' },
  { id: '7', icon: '🏋️', name: 'Fitness', members: 720, color: '#F44336' },
  { id: '8', icon: '🎨', name: 'Artists', members: 560, color: '#FF9800' },
];

const MODES = [
  { id: 'dating', icon: '💕', label: 'Dating' },
  { id: 'friends', icon: '🤝', label: 'Friends' },
  { id: 'networking', icon: '💼', label: 'Network' },
];

export default function Discover() {
  const { colors } = useTheme();
  const [selectedMode, setSelectedMode] = useState('dating');
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const button = () => <EvilIcons name="question" size={24} color={colors.text} />;

  const toggleJoin = (id: string) => {
    setJoinedCommunities(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background, flex: 1 }}>
      <View style={{ paddingHorizontal: 16, gap: 20, paddingBottom: 40 }}>
        <Header headerTitle={"Discover"} button={button} />

        {/* Mode Selector */}
        <View style={[styles.modeSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🎯 What are you here for?
          </Text>
          <View style={styles.modeRow}>
            {MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.modeChip,
                  { borderColor: colors.border },
                  selectedMode === mode.id && { backgroundColor: '#E91E63', borderColor: '#E91E63' }
                ]}
                onPress={() => setSelectedMode(mode.id)}
              >
                <Text style={styles.modeEmoji}>{mode.icon}</Text>
                <Text style={[
                  styles.modeLabel,
                  { color: colors.text },
                  selectedMode === mode.id && { color: 'white' }
                ]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Communities */}
        <View style={{ gap: 12 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            👥 Interest Communities
          </Text>
          <Text style={[styles.subTitle, { color: colors.subtext }]}>
            Join communities to meet people with same interests
          </Text>

          <View style={styles.communitiesGrid}>
            {COMMUNITIES.map((community) => {
              const isJoined = joinedCommunities.includes(community.id);
              return (
                <View
                  key={community.id}
                  style={[styles.communityCard, { backgroundColor: colors.card }]}
                >
                  <View style={[styles.communityIcon, { backgroundColor: community.color + '20' }]}>
                    <Text style={styles.communityEmoji}>{community.icon}</Text>
                  </View>
                  <Text style={[styles.communityName, { color: colors.text }]}>
                    {community.name}
                  </Text>
                  <Text style={[styles.communityMembers, { color: colors.subtext }]}>
                    {community.members.toLocaleString()} members
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.joinBtn,
                      { backgroundColor: isJoined ? colors.border : community.color }
                    ]}
                    onPress={() => toggleJoin(community.id)}
                  >
                    <Text style={[styles.joinText, { color: isJoined ? colors.text : 'white' }]}>
                      {isJoined ? '✓ Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Trending */}
        <View style={{ gap: 12 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🔥 Trending Near You
          </Text>
          {[
            { title: 'Weekend Hiking Trip', community: 'Travel Bugs', members: 24, icon: '🥾' },
            { title: 'Coffee & Code Meetup', community: 'Tech Lovers', members: 18, icon: '☕' },
            { title: 'Open Mic Night', community: 'Music Vibes', members: 35, icon: '🎤' },
          ].map((event, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.eventCard, { backgroundColor: colors.card }]}
            >
              <Text style={styles.eventIcon}>{event.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                <Text style={[styles.eventCommunity, { color: colors.subtext }]}>
                  {event.community} • {event.members} going
                </Text>
              </View>
              <TouchableOpacity style={styles.rsvpBtn}>
                <Text style={styles.rsvpText}>RSVP</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  subTitle: { fontSize: 13 },
  modeSection: { borderRadius: 16, padding: 16, gap: 12 },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  modeEmoji: { fontSize: 18 },
  modeLabel: { fontSize: 14, fontWeight: '600' },
  communitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  communityCard: { width: '47%', borderRadius: 16, padding: 14, alignItems: 'center', gap: 8 },
  communityIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  communityEmoji: { fontSize: 28 },
  communityName: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  communityMembers: { fontSize: 11, textAlign: 'center' },
  joinBtn: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20 },
  joinText: { fontSize: 13, fontWeight: '600' },
  eventCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
  eventIcon: { fontSize: 32 },
  eventTitle: { fontSize: 15, fontWeight: '600' },
  eventCommunity: { fontSize: 12, marginTop: 2 },
  rsvpBtn: { backgroundColor: '#E91E63', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  rsvpText: { color: 'white', fontSize: 12, fontWeight: '700' },
});