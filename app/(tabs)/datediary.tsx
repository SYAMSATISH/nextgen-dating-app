import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '@/constants/appwrite';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { useTheme } from '@/constants/ThemeContext';

export default function DateDiary() {
  const router = useRouter();
  const { colors } = useTheme();
  const [entries, setEntries] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [mood, setMood] = useState('😊');

  const MOODS = ['😊', '❤️', '😍', '🥰', '😢', '😤', '🤩', '😎'];

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const q = query(collection(db, 'users', uid, 'datediary'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setEntries([]);
    }
  };

  const saveEntry = async () => {
    if (!title.trim()) return Alert.alert('Title kavali!');
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await addDoc(collection(db, 'users', uid, 'datediary'), {
      title, note, mood,
      createdAt: new Date(),
    });
    setTitle(''); setNote(''); setMood('😊');
    setShowAdd(false);
    loadEntries();
    Alert.alert('✅ Saved!', 'Diary entry saved!');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background, flex: 1 }}>
      <View style={{ padding: 20, gap: 16, paddingBottom: 100 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>📔 Date Diary</Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={{ backgroundColor: '#FF2D7A', padding: 14, borderRadius: 14, alignItems: 'center' }}
          onPress={() => setShowAdd(!showAdd)}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
            {showAdd ? '✕ Cancel' : '+ New Entry'}
          </Text>
        </TouchableOpacity>

        {/* Add Form */}
        {showAdd && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>How was your date? 💕</Text>

            {/* Mood selector */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {MOODS.map(m => (
                <TouchableOpacity key={m} onPress={() => setMood(m)}
                  style={{ padding: 6, borderRadius: 8, backgroundColor: mood === m ? 'rgba(255,45,122,0.2)' : 'transparent' }}>
                  <Text style={{ fontSize: 22 }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Date title... (e.g. Coffee with Priya)"
              placeholderTextColor={colors.subtext}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, minHeight: 80 }]}
              placeholder="How did it go? Write your thoughts..."
              placeholderTextColor={colors.subtext}
              value={note}
              onChangeText={setNote}
              multiline
            />
            <TouchableOpacity
              style={{ backgroundColor: '#FF2D7A', padding: 12, borderRadius: 12, alignItems: 'center' }}
              onPress={saveEntry}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Save Entry 💾</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Entries */}
        {entries.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 40 }}>📔</Text>
            <Text style={{ color: colors.subtext, marginTop: 8 }}>No entries yet! Add your first date memory!</Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Text style={{ fontSize: 28 }}>{entry.mood}</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 }}>{entry.title}</Text>
              </View>
              {entry.note ? <Text style={{ color: colors.subtext, fontSize: 13 }}>{entry.note}</Text> : null}
              <Text style={{ color: colors.subtext, fontSize: 11, marginTop: 6 }}>
                {entry.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 14, marginBottom: 8 },
});