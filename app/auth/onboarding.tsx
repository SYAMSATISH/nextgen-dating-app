import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../constants/appwrite';
import { doc, updateDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const INTENTS = [
  {
    id: 'relationship',
    emoji: '💍',
    title: 'Serious Relationship',
    description: 'Looking for a long-term committed partner',
    color: '#E91E63',
    bg: '#FDE8EF',
  },
  {
    id: 'casual',
    emoji: '☀️',
    title: 'Casual Dating',
    description: 'Keep it fun and light, no pressure',
    color: '#FF9800',
    bg: '#FFF3E0',
  },
  {
    id: 'friends',
    emoji: '🤝',
    title: 'New Friends',
    description: 'Meet interesting people around you',
    color: '#2196F3',
    bg: '#E3F2FD',
  },
  {
    id: 'networking',
    emoji: '💼',
    title: 'Networking',
    description: 'Connect professionally and grow together',
    color: '#4CAF50',
    bg: '#E8F5E9',
  },
];

const OnboardingScreen = () => {
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        await updateDoc(doc(db, 'users', uid), {
          intent: selected,
        });
      }
      router.replace('/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What are you looking for?</Text>
        <Text style={styles.subtitle}>
          This helps us find your perfect match
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {INTENTS.map((intent) => (
          <TouchableOpacity
            key={intent.id}
            style={[
              styles.card,
              { borderColor: selected === intent.id ? intent.color : '#E0E0E0' },
              selected === intent.id && { backgroundColor: intent.bg },
            ]}
            onPress={() => setSelected(intent.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.emojiContainer, { backgroundColor: intent.bg }]}>
              <Text style={styles.emoji}>{intent.emoji}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, selected === intent.id && { color: intent.color }]}>
                {intent.title}
              </Text>
              <Text style={styles.cardDesc}>{intent.description}</Text>
            </View>
            {selected === intent.id && (
              <View style={[styles.checkmark, { backgroundColor: intent.color }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: selected ? '#E91E63' : '#ccc' }
        ]}
        onPress={handleContinue}
        disabled={!selected || loading}
      >
        <Text style={styles.continueText}>
          {loading ? 'Saving...' : 'Continue →'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  cardsContainer: {
    gap: 14,
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#fff',
    gap: 14,
  },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#888',
  },
  checkmark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  continueButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  continueText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});