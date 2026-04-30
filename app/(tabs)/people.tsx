import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import PeopleCard from "@/components/PeopleCard";
import { Octicons } from "@expo/vector-icons";
import Header from "@/components/Header";
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

const people = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const button = () => <Octicons name="filter" size={24} color="black" />;

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId);
    const uid = auth.currentUser?.uid;
    if (uid) {
      await updateDoc(doc(db, 'users', uid), {
        currentMood: moodId,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header headerTitle={"NextGen Dating"} button={button} />

      {/* Mood Selector */}
      <View style={styles.moodContainer}>
        <Text style={styles.moodTitle}>Today's Vibe 🎯</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.moodRow}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodChip,
                  selectedMood === mood.id && styles.moodChipSelected,
                ]}
                onPress={() => handleMoodSelect(mood.id)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  selectedMood === mood.id && styles.moodLabelSelected,
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <PeopleCard selectedMood={selectedMood} />
    </View>
  );
};

export default people;

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("screen").height,
    width: Dimensions.get("screen").width,
    paddingHorizontal: 8,
  },
  moodContainer: {
    paddingVertical: 10,
  },
  moodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  moodChipSelected: {
    borderColor: '#E91E63',
    backgroundColor: '#FDE8EF',
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: '#E91E63',
    fontWeight: '600',
  },
});