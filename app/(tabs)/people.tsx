import { Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import PeopleCard from "@/components/PeopleCard";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@/constants/appwrite";
import { doc, updateDoc } from "firebase/firestore";

const MOODS = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "romantic", emoji: "💕", label: "Romantic" },
  { id: "adventurous", emoji: "🌍", label: "Adventure" },
  { id: "chill", emoji: "😎", label: "Chill" },
  { id: "nerdy", emoji: "🤓", label: "Nerdy" },
  { id: "sporty", emoji: "⚽", label: "Sporty" },
];

const People = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [activeTab, setActiveTab] = useState('foryou'); // 👈 NEW: added missing state

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(prev => prev === moodId ? '' : moodId);
    const uid = auth.currentUser?.uid;
    if (uid) {
      await updateDoc(doc(db, 'users', uid), { currentMood: moodId });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Discover</Text>
          <Text style={styles.headerTitle}>NextGen Dating ✨</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* FOR YOU / NEARBY tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'foryou' && styles.tabBtnActive]}
          onPress={() => setActiveTab('foryou')}
        >
          <Text style={activeTab === 'foryou' ? styles.tabTextActive : styles.tabText}>FOR YOU</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'nearby' && styles.tabBtnActive]}
          onPress={() => setActiveTab('nearby')}
        >
          <Text style={activeTab === 'nearby' ? styles.tabTextActive : styles.tabText}>NEARBY</Text>
        </TouchableOpacity>
      </View>

      {/* Mood Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll} contentContainerStyle={styles.moodRow}>
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[styles.moodChip, selectedMood === mood.id && styles.moodChipSelected]}
            onPress={() => handleMoodSelect(mood.id)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[styles.moodLabel, selectedMood === mood.id && styles.moodLabelSelected]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cards */}
      <PeopleCard selectedMood={selectedMood} activeTab={activeTab} />
    </View>
  );
};

export default People;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerSub: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 20,
    marginBottom: 14,
  },
  tabBtn: {
    paddingBottom: 8,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF2D7A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    letterSpacing: 1,
  },
  tabTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  moodScroll: {
    maxHeight: 44,
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
  },
  moodChipSelected: {
    borderColor: '#FF2D7A',
    backgroundColor: 'rgba(255,45,122,0.15)',
  },
  moodEmoji: { fontSize: 14 },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: '#FF2D7A',
    fontWeight: '600',
  },
});