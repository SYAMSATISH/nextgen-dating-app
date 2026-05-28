import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/ThemeContext';
import { FONTS } from '@/constants/fonts';
import { auth, db } from '@/constants/appwrite';
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const VIBES = [
  { id: 'amazing', label: 'Amazing', icon: 'flame', color: '#FF2D7A', score: 5 },
  { id: 'good', label: 'Good', icon: 'happy', color: '#FFD700', score: 4 },
  { id: 'okay', label: 'Okay', icon: 'remove-circle', color: '#4FC3F7', score: 3 },
  { id: 'meh', label: 'Meh', icon: 'sad', color: '#FF6B00', score: 2 },
  { id: 'disaster', label: 'Disaster', icon: 'skull', color: '#607D8B', score: 1 },
];

type DateEntry = {
  id: string;
  personName: string;
  place: string;
  date: string;
  vibe: string;
  notes: string;
  score: number;
};

export default function DateDiary() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [dates, setDates] = useState<DateEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'log' | 'chart'>('log');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [personName, setPersonName] = useState('');
  const [place, setPlace] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { loadDates(); }, []);

  const loadDates = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const q = query(collection(db, 'dateDiary'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const entries: DateEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as any,
      }));
      setDates(entries);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddDate = async () => {
    if (!personName || !selectedVibe) {
      Alert.alert('Required', 'Please enter person name and vibe!');
      return;
    }
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      const vibe = VIBES.find(v => v.id === selectedVibe);
      await addDoc(collection(db, 'dateDiary'), {
        userId: uid,
        personName,
        place,
        date: new Date().toISOString().split('T')[0],
        vibe: selectedVibe,
        notes,
        score: vibe?.score || 3,
        createdAt: serverTimestamp(),
      });
      setPersonName(''); setPlace(''); setSelectedVibe(''); setNotes('');
      setShowAddModal(false);
      await loadDates();
    } catch (error) {
      Alert.alert('Error', 'Could not save date entry');
    }
    setLoading(false);
  };

  const totalDates = dates.length;
  const avgVibe = dates.length > 0 ? (dates.reduce((acc, d) => acc + d.score, 0) / dates.length).toFixed(1) : '0.0';
  const amazingCount = dates.filter(d => d.vibe === 'amazing').length;

  const chartData = dates.slice(0, 7).reverse().map(d => d.score);
  const chartLabels = dates.slice(0, 7).reverse().map(d => d.personName.slice(0, 4));

  return (
    <View style={[styles.container, { backgroundColor: '#0d0a1a' }]}>

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { fontFamily: FONTS.bold }]}>💘 Date Diary</Text>
          <Text style={[styles.headerSub, { fontFamily: FONTS.regular }]}>YOUR ROMANTIC FIELD NOTES</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={[styles.statNum, { fontFamily: FONTS.bold }]}>{totalDates}</Text>
            <Text style={[styles.statLabel, { fontFamily: FONTS.regular }]}>TOTAL DATES</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
            <Text style={styles.statEmoji}>✨</Text>
            <Text style={[styles.statNum, { fontFamily: FONTS.bold }]}>{avgVibe}/5</Text>
            <Text style={[styles.statLabel, { fontFamily: FONTS.regular }]}>AVG VIBE</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
            <Text style={[styles.statNum, { color: '#FF2D7A', fontFamily: FONTS.bold }]}>{amazingCount}</Text>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statLabel, { fontFamily: FONTS.regular }]}>AMAZING</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabRow, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'log' && styles.tabBtnActive]}
            onPress={() => setActiveTab('log')}
          >
            <Text style={[styles.tabText, { fontFamily: FONTS.semibold, color: activeTab === 'log' ? '#fff' : '#888' }]}>
              📓 Date Log
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'chart' && styles.tabBtnActive]}
            onPress={() => setActiveTab('chart')}
          >
            <Text style={[styles.tabText, { fontFamily: FONTS.semibold, color: activeTab === 'chart' ? '#fff' : '#888' }]}>
              📊 Vibe Chart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vibe Chart */}
        {activeTab === 'chart' && (
          <View style={[styles.chartCard, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
            <Text style={[styles.chartTitle, { color: '#fff', fontFamily: FONTS.bold }]}>Vibe Over Time</Text>
            <Text style={[styles.chartSub, { color: '#888', fontFamily: FONTS.regular }]}>Your date energy tracked chronologically</Text>
            {chartData.length > 1 ? (
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: chartData.length > 0 ? chartData : [0], color: () => '#FF2D7A', strokeWidth: 2 }],
                }}
                width={width - 72}
                height={200}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 45, 122, ${opacity})`,
                  labelColor: () => '#888',
                  propsForDots: { r: '5', strokeWidth: '2', stroke: '#FF2D7A' },
                }}
                bezier
                style={{ borderRadius: 12, marginTop: 12 }}
                withInnerLines={false}
                withOuterLines={false}
              />
            ) : (
              <View style={styles.noDataWrap}>
                <Text style={[styles.noDataText, { color: '#555', fontFamily: FONTS.regular }]}>
                  Add at least 2 dates to see chart! 📊
                </Text>
              </View>
            )}
            {/* Vibe Legend */}
            <View style={styles.legendRow}>
              {VIBES.map(v => (
                <View key={v.id} style={styles.legendItem}>
                  <Ionicons name={v.icon as any} size={14} color={v.color} />
                  <Text style={[styles.legendText, { color: '#888', fontFamily: FONTS.regular }]}>{v.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Date Log */}
        {activeTab === 'log' && (
          <View style={{ gap: 12 }}>
            {dates.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 48 }}>💘</Text>
                <Text style={[styles.emptyTitle, { color: '#fff', fontFamily: FONTS.bold }]}>No dates logged yet!</Text>
                <Text style={[styles.emptySub, { color: '#888', fontFamily: FONTS.regular }]}>Tap + Log a Date to start your diary</Text>
              </View>
            ) : (
              dates.map((entry) => {
                const vibe = VIBES.find(v => v.id === entry.vibe);
                return (
                  <View key={entry.id} style={[styles.dateCard, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
                    <View style={styles.dateCardHeader}>
                      <View style={styles.dateCardLeft}>
                        <Ionicons name={vibe?.icon as any || 'happy'} size={28} color={vibe?.color || '#FFD700'} />
                        <View>
                          <Text style={[styles.dateName, { color: '#fff', fontFamily: FONTS.bold }]}>{entry.personName}</Text>
                          <Text style={[styles.dateMeta, { color: '#888', fontFamily: FONTS.regular }]}>
                            {entry.place} · {entry.date}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.vibeBadge, { backgroundColor: `${vibe?.color}33`, borderColor: vibe?.color }]}>
                        <Text style={[styles.vibeBadgeText, { color: vibe?.color, fontFamily: FONTS.semibold }]}>
                          {vibe?.label}
                        </Text>
                      </View>
                    </View>
                    {entry.notes ? (
                      <Text style={[styles.dateNotes, { color: '#aaa', fontFamily: FONTS.regular }]}>
                        "{entry.notes}"
                      </Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        )}

      </ScrollView>

      {/* Log a Date FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={[styles.fabText, { fontFamily: FONTS.bold }]}>Log a Date</Text>
      </TouchableOpacity>

      {/* Add Date Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#1a0a2e' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#fff', fontFamily: FONTS.bold }]}>Log a Date 💘</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: '#fff', borderColor: 'rgba(255,255,255,0.2)', fontFamily: FONTS.regular }]}
              placeholder="Person's name"
              placeholderTextColor="#555"
              value={personName}
              onChangeText={setPersonName}
            />

            <TextInput
              style={[styles.input, { color: '#fff', borderColor: 'rgba(255,255,255,0.2)', fontFamily: FONTS.regular }]}
              placeholder="Place (e.g. Coffee House)"
              placeholderTextColor="#555"
              value={place}
              onChangeText={setPlace}
            />

            <Text style={[styles.vibeLabel, { color: '#aaa', fontFamily: FONTS.semibold }]}>How was the vibe?</Text>
            <View style={styles.vibeRow}>
              {VIBES.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vibeChip, { borderColor: selectedVibe === v.id ? v.color : 'rgba(255,255,255,0.15)', backgroundColor: selectedVibe === v.id ? `${v.color}33` : 'transparent' }]}
                  onPress={() => setSelectedVibe(v.id)}
                >
                  <Ionicons name={v.icon as any} size={18} color={selectedVibe === v.id ? v.color : '#555'} />
                  <Text style={[styles.vibeChipText, { color: selectedVibe === v.id ? v.color : '#555', fontFamily: FONTS.medium }]}>
                    {v.label}
                  </Text>
>>>>>>> 7a5fb3f31 (feat: date diary, vibe chart, log a date feature)
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
<<<<<<< HEAD
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
=======
              style={[styles.input, styles.notesInput, { color: '#fff', borderColor: 'rgba(255,255,255,0.2)', fontFamily: FONTS.regular }]}
              placeholder="Any memorable moments? (optional)"
              placeholderTextColor="#555"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleAddDate} disabled={loading}>
              <Text style={[styles.saveBtnText, { fontFamily: FONTS.bold }]}>
                {loading ? 'Saving...' : '💾 Save Date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
>>>>>>> 7a5fb3f31 (feat: date diary, vibe chart, log a date feature)
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 14, marginBottom: 8 },
=======
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 52, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FF2D7A' },
  headerSub: { fontSize: 10, color: '#888', letterSpacing: 1.5, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 22 },
  statNum: { fontSize: 20, fontWeight: '700', color: '#FF2D7A' },
  statLabel: { fontSize: 9, color: '#888', letterSpacing: 1, textAlign: 'center' },
  tabRow: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 4 },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#FF2D7A' },
  tabText: { fontSize: 13 },
  chartCard: { borderRadius: 16, padding: 16, gap: 4 },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  chartSub: { fontSize: 12, marginBottom: 4 },
  noDataWrap: { height: 100, alignItems: 'center', justifyContent: 'center' },
  noDataText: { fontSize: 13 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 11 },
  emptyState: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 13 },
  dateCard: { borderRadius: 16, padding: 16, gap: 8 },
  dateCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateName: { fontSize: 16, fontWeight: '700' },
  dateMeta: { fontSize: 12, marginTop: 2 },
  vibeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  vibeBadgeText: { fontSize: 12 },
  dateNotes: { fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  fab: { position: 'absolute', bottom: 100, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FF2D7A', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, shadowColor: '#FF2D7A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 14, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, color: '#fff' },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  vibeLabel: { fontSize: 13 },
  vibeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vibeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  vibeChipText: { fontSize: 12 },
  saveBtn: { backgroundColor: '#FF2D7A', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
>>>>>>> 7a5fb3f31 (feat: date diary, vibe chart, log a date feature)
});