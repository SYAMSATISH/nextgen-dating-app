import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, TextInput, Modal, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/ThemeContext';
import { FONTS } from '@/constants/fonts';
import { Audio } from 'expo-av';
import { auth, db } from '@/constants/appwrite';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const PROMPTS = [
  { id: '1', question: "Two truths and a lie about me..." },
  { id: '2', question: "My ideal Sunday looks like..." },
  { id: '3', question: "I'm looking for someone who..." },
  { id: '4', question: "The most spontaneous thing I've done..." },
  { id: '5', question: "My love language is..." },
  { id: '6', question: "A random fact about me..." },
];

const PERSONALITY_QUESTIONS = [
  { id: 'q1', question: "Are you more introverted or extroverted?", options: ["🏠 Introvert", "🎉 Extrovert", "⚖️ Ambivert"] },
  { id: 'q2', question: "What's your love language?", options: ["🤝 Acts of Service", "💬 Words of Affirmation", "🎁 Gift Giving", "⏰ Quality Time"] },
  { id: 'q3', question: "Your ideal first date?", options: ["☕ Coffee Chat", "🍽️ Dinner", "🎬 Movie", "🌳 Nature Walk"] },
  { id: 'q4', question: "How do you handle conflict?", options: ["💬 Talk it out", "😶 Need space first", "📝 Write it down"] },
];

export default function StoryProfile() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'prompts' | 'audio' | 'quiz'>('prompts');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBioSaved, setAudioBioSaved] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [promptAnswer, setPromptAnswer] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<{ [key: string]: string }>({});
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [showPromptModal, setShowPromptModal] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone permission is required!');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      startPulse();
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 30) { stopRecording(); return prev; }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    clearInterval(timerRef.current);
    setIsRecording(false);
    stopPulse();
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (uri) {
      Alert.alert('Audio Bio Saved! 🎙️', 'Your voice bio has been recorded successfully!');
      setAudioBioSaved(true);
      const uid = auth.currentUser?.uid;
      if (uid) {
        await updateDoc(doc(db, 'users', uid), { audioBioUri: uri, audioBioRecorded: true });
      }
    }
  };

  const savePromptAnswer = async () => {
    if (!selectedPrompt || !promptAnswer) return;
    const newSaved = { ...savedPrompts, [selectedPrompt]: promptAnswer };
    setSavedPrompts(newSaved);
    const uid = auth.currentUser?.uid;
    if (uid) {
      await updateDoc(doc(db, 'users', uid), { storyPrompts: newSaved });
    }
    setPromptAnswer('');
    setSelectedPrompt(null);
    setShowPromptModal(false);
  };

  const saveQuizAnswer = async (questionId: string, answer: string) => {
    const newAnswers = { ...quizAnswers, [questionId]: answer };
    setQuizAnswers(newAnswers);
    const uid = auth.currentUser?.uid;
    if (uid) {
      await updateDoc(doc(db, 'users', uid), { personalityQuiz: newAnswers });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Story Profile</Text>
          <Text style={[styles.headerSub, { color: colors.subtext, fontFamily: FONTS.regular }]}>Stand out from the crowd ✨</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab Row */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { id: 'prompts', icon: 'chatbubble-ellipses', label: 'Prompts' },
          { id: 'audio', icon: 'mic', label: 'Voice Bio' },
          { id: 'quiz', icon: 'help-circle', label: 'Quiz' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, activeTab === tab.id && { backgroundColor: '#FF2D7A' }]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.id ? '#fff' : colors.subtext} />
            <Text style={[styles.tabText, { color: activeTab === tab.id ? '#fff' : colors.subtext, fontFamily: FONTS.medium }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>

        {/* PROMPTS TAB */}
        {activeTab === 'prompts' && (
          <View style={{ gap: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>
              Answer prompts to show your personality
            </Text>
            {PROMPTS.map((prompt) => {
              const answered = savedPrompts[prompt.id];
              return (
                <TouchableOpacity
                  key={prompt.id}
                  style={[styles.promptCard, { backgroundColor: colors.card, borderColor: answered ? '#FF2D7A' : colors.border }]}
                  onPress={() => { setSelectedPrompt(prompt.id); setPromptAnswer(answered || ''); setShowPromptModal(true); }}
                >
                  <View style={styles.promptHeader}>
                    <View style={[styles.promptIconWrap, { backgroundColor: answered ? 'rgba(255,45,122,0.15)' : 'rgba(255,255,255,0.05)' }]}>
                      <Ionicons name="chatbubble-outline" size={16} color={answered ? '#FF2D7A' : colors.subtext} />
                    </View>
                    <Text style={[styles.promptQuestion, { color: colors.text, fontFamily: FONTS.semibold }]}>
                      {prompt.question}
                    </Text>
                  </View>
                  {answered ? (
                    <Text style={[styles.promptAnswer, { color: colors.subtext, fontFamily: FONTS.regular }]} numberOfLines={2}>
                      "{answered}"
                    </Text>
                  ) : (
                    <Text style={[styles.promptAdd, { color: '#FF2D7A', fontFamily: FONTS.medium }]}>
                      + Tap to answer
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* AUDIO BIO TAB */}
        {activeTab === 'audio' && (
          <View style={{ gap: 20, alignItems: 'center' }}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold, textAlign: 'center' }]}>
              Record your Voice Bio 🎙️
            </Text>
            <Text style={[styles.sectionSub, { color: colors.subtext, fontFamily: FONTS.regular, textAlign: 'center' }]}>
              Let people hear your voice before matching. Max 30 seconds!
            </Text>

            {/* Recording circle */}
            <Animated.View style={[styles.recordOuter, { transform: [{ scale: pulseAnim }], borderColor: isRecording ? '#FF2D7A' : colors.border }]}>
              <TouchableOpacity
                style={[styles.recordBtn, { backgroundColor: isRecording ? '#FF2D7A' : colors.card }]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons name={isRecording ? "stop" : "mic"} size={40} color={isRecording ? '#fff' : '#FF2D7A'} />
              </TouchableOpacity>
            </Animated.View>

            {isRecording && (
              <View style={styles.timerRow}>
                <View style={styles.timerDot} />
                <Text style={[styles.timerText, { color: '#FF2D7A', fontFamily: FONTS.bold }]}>
                  {recordingDuration}s / 30s
                </Text>
              </View>
            )}

            <Text style={[styles.recordHint, { color: colors.subtext, fontFamily: FONTS.regular }]}>
              {isRecording ? 'Tap to stop recording' : audioBioSaved ? '✅ Voice bio recorded!' : 'Tap mic to start recording'}
            </Text>

            {audioBioSaved && (
              <View style={[styles.savedBadge, { backgroundColor: 'rgba(74,222,128,0.15)', borderColor: '#4ade80' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                <Text style={[styles.savedText, { color: '#4ade80', fontFamily: FONTS.semibold }]}>
                  Voice bio saved! Others can hear you 🎉
                </Text>
              </View>
            )}

            {/* Tips */}
            <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.tipsTitle, { color: colors.text, fontFamily: FONTS.bold }]}>💡 Tips for a great voice bio</Text>
              {[
                "Introduce yourself naturally",
                "Share something unique about you",
                "Keep it fun and light!",
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#FF2D7A" />
                  <Text style={[styles.tipText, { color: colors.subtext, fontFamily: FONTS.regular }]}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <View style={{ gap: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>
              Personality Quiz
            </Text>
            <Text style={[styles.sectionSub, { color: colors.subtext, fontFamily: FONTS.regular }]}>
              Help matches understand you better!
            </Text>
            {PERSONALITY_QUESTIONS.map((q) => (
              <View key={q.id} style={[styles.quizCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.quizQuestion, { color: colors.text, fontFamily: FONTS.semibold }]}>
                  {q.question}
                </Text>
                <View style={styles.optionsGrid}>
                  {q.options.map((option) => {
                    const isSelected = quizAnswers[q.id] === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.optionBtn, { borderColor: isSelected ? '#FF2D7A' : colors.border, backgroundColor: isSelected ? 'rgba(255,45,122,0.15)' : colors.background }]}
                        onPress={() => saveQuizAnswer(q.id, option)}
                      >
                        <Text style={[styles.optionText, { color: isSelected ? '#FF2D7A' : colors.text, fontFamily: FONTS.medium }]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Prompt Answer Modal */}
      <Modal visible={showPromptModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Answer Prompt</Text>
              <TouchableOpacity onPress={() => setShowPromptModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalQuestion, { color: colors.subtext, fontFamily: FONTS.regular }]}>
              {PROMPTS.find(p => p.id === selectedPrompt)?.question}
            </Text>
            <TextInput
              style={[styles.promptInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, fontFamily: FONTS.regular }]}
              placeholder="Type your answer..."
              placeholderTextColor={colors.subtext}
              value={promptAnswer}
              onChangeText={setPromptAnswer}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.savePromptBtn} onPress={savePromptAnswer}>
              <Text style={[styles.savePromptText, { fontFamily: FONTS.bold }]}>Save Answer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 52, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSub: { fontSize: 12, textAlign: 'center', marginTop: 2 },
  tabRow: { flexDirection: 'row', margin: 16, borderRadius: 16, padding: 4, borderWidth: 1, gap: 4 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  tabText: { fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionSub: { fontSize: 13, lineHeight: 18 },
  promptCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  promptHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  promptIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  promptQuestion: { flex: 1, fontSize: 14 },
  promptAnswer: { fontSize: 13, fontStyle: 'italic', paddingLeft: 42 },
  promptAdd: { fontSize: 13, paddingLeft: 42 },
  recordOuter: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  recordBtn: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF2D7A' },
  timerText: { fontSize: 18 },
  recordHint: { fontSize: 14, textAlign: 'center' },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  savedText: { fontSize: 13 },
  tipsCard: { width: '100%', borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  tipsTitle: { fontSize: 14 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipText: { fontSize: 13, flex: 1 },
  quizCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  quizQuestion: { fontSize: 15 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  optionText: { fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalQuestion: { fontSize: 14, fontStyle: 'italic' },
  promptInput: { borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
  savePromptBtn: { backgroundColor: '#FF2D7A', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  savePromptText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});