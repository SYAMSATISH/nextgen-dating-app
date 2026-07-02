import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, Platform, ActivityIndicator, Animated,
  KeyboardAvoidingView, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, rtdb } from '@/constants/appwrite';
import { ref, push, onValue, off } from 'firebase/database';
import { useTheme } from '@/constants/ThemeContext';
import { FONTS } from '@/constants/fonts';
import { Audio } from 'expo-av';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/constants/appwrite';

const BASE_URL = 'https://sanded-livable-salary.ngrok-free.dev';
const ICEBREAKER_API = `${BASE_URL}/api/icebreakers`;
const SMART_REPLY_API = `${BASE_URL}/api/smart-reply`;
const REPORT_API = `${BASE_URL}/api/report-user`;

const REPORT_REASONS = ['Spam', 'Fake Profile', 'Harassment', 'Other'];

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  type?: 'text' | 'voice';
  duration?: number;
};

const DEMO_OTHER_USER = { id: 'demo_user', name: 'Priya Sharma' };

export default function ChatScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const currentUid = auth.currentUser?.uid || 'current_user';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [loadingIce, setLoadingIce] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(true);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  // ✅ Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  // ✅ Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const chatId = [currentUid, DEMO_OTHER_USER.id].sort().join('_');

  useEffect(() => {
    loadIcebreakers();
    if (Platform.OS !== 'web') loadMessages();
    return () => {
      if (Platform.OS !== 'web') off(ref(rtdb, `chats/${chatId}/messages`));
    };
  }, []);

  const loadMessages = () => {
    const chatRef = ref(rtdb, `chats/${chatId}/messages`);
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data).map(([id, val]: any) => ({ id, ...val }));
        msgs.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);
        if (msgs.length > 0) setShowIcebreakers(false);
      }
    });
  };

  const loadIcebreakers = async () => {
    setLoadingIce(true);
    try {
      const res = await fetch(ICEBREAKER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1: { name: 'You', interests: ['coding'] },
          user2: { name: DEMO_OTHER_USER.name, interests: ['music'] },
        }),
      });
      const data = await res.json();
      setIcebreakers(data.icebreakers || []);
    } catch {
      setIcebreakers([
        "What's your favorite weekend activity? 🌟",
        "If you could travel anywhere? ✈️",
        "Last show you binge-watched? 📺",
      ]);
    }
    setLoadingIce(false);
  };

  const loadSmartReplies = async (lastMessage: string) => {
    try {
      const res = await fetch(SMART_REPLY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: messages.map(m => m.text), lastMessage }),
      });
      const data = await res.json();
      setSmartReplies(data.replies || []);
    } catch {
      setSmartReplies(["That sounds amazing! 😊", "Tell me more!", "Haha cool 😄"]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      senderId: currentUid,
      timestamp: Date.now(),
      type: 'text',
    };
    setMessages(prev => [...prev, newMsg]);
    if (Platform.OS !== 'web') {
      await push(ref(rtdb, `chats/${chatId}/messages`), {
        text: text.trim(), senderId: currentUid, timestamp: Date.now(), type: 'text',
      });
    }
    setInputText('');
    setShowIcebreakers(false);
    setSmartReplies([]);
    await loadSmartReplies(text);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd();
      inputRef.current?.focus();
    }, 100);
  };

  // ✅ Report submit
  const submitReport = async () => {
    if (!selectedReason) return;
    setReportSubmitting(true);
    try {
      const res = await fetch(REPORT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: currentUid,
          reportedUserId: DEMO_OTHER_USER.id,
          reason: selectedReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReportDone(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportDone(false);
          setSelectedReason('');
        }, 2000);
      } else {
        throw new Error('Failed');
      }
    } catch {
      // Firebase fallback
      await addDoc(collection(db, 'reports'), {
        reportedUserId: DEMO_OTHER_USER.id,
        reportedBy: currentUid,
        reason: selectedReason,
        timestamp: new Date(),
        status: 'pending',
      });
      setReportDone(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportDone(false);
        setSelectedReason('');
      }, 2000);
    }
    setReportSubmitting(false);
  };

  // ✅ Feedback submit
  const submitFeedback = async () => {
    if (feedbackRating === 0) {
      showAlert('Rating required', 'Please select a star rating!');
      return;
    }
    try {
      await addDoc(collection(db, 'feedback'), {
        fromUserId: currentUid,
        toUserId: DEMO_OTHER_USER.id,
        rating: feedbackRating,
        comment: feedbackText,
        timestamp: new Date(),
      });
      setShowFeedbackModal(false);
      setFeedbackRating(0);
      setFeedbackText('');
      showAlert('✅ Feedback sent!', 'Thank you for your feedback!');
    } catch {
      showAlert('Error', 'Could not submit feedback. Try again!');
    }
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        showAlert('Voice messages', 'Voice messages work on mobile only!');
        return;
      }
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) { stopRecording(); return prev; }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    clearInterval(timerRef.current);
    setIsRecording(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (uri) {
      const voiceMsg: Message = {
        id: Date.now().toString(),
        text: '🎤 Voice message',
        senderId: currentUid,
        timestamp: Date.now(),
        type: 'voice',
        duration: recordingDuration,
      };
      setMessages(prev => [...prev, voiceMsg]);
      setShowIcebreakers(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUid;
    if (item.type === 'voice') {
      return (
        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
          <TouchableOpacity
            style={[styles.voiceBubble, isMe ? styles.voiceBubbleMe : [styles.voiceBubbleOther, { backgroundColor: colors.card }]]}
            onPress={() => setPlayingId(playingId === item.id ? null : item.id)}
          >
            <Ionicons name={playingId === item.id ? "pause" : "play"} size={20} color={isMe ? '#fff' : '#FF2D7A'} />
            <View style={[styles.voiceWave, { backgroundColor: isMe ? 'rgba(255,255,255,0.3)' : 'rgba(255,45,122,0.2)' }]}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={[styles.waveBar, { height: Math.random() * 16 + 6, backgroundColor: isMe ? '#fff' : '#FF2D7A' }]} />
              ))}
            </View>
            <Text style={[styles.voiceDuration, { color: isMe ? '#fff' : colors.subtext, fontFamily: FONTS.regular }]}>
              {item.duration || 0}s
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : [styles.bubbleOther, { backgroundColor: colors.card }]]}>
          <Text style={[styles.messageText, { fontFamily: FONTS.regular }, isMe ? { color: '#fff' } : { color: colors.text }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text, fontFamily: FONTS.bold }]}>{DEMO_OTHER_USER.name}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.onlineText, { color: colors.subtext, fontFamily: FONTS.regular }]}>Online</Text>
          </View>
        </View>
        {/* Video Call */}
        <TouchableOpacity style={[styles.callBtn, { backgroundColor: 'rgba(255,45,122,0.15)' }]}
          onPress={() => showAlert('📹 Video Call', 'Video calling coming soon! 🚀')}>
          <Ionicons name="videocam-outline" size={22} color="#FF2D7A" />
        </TouchableOpacity>
        {/* ✅ Star = Feedback */}
        <TouchableOpacity style={[styles.callBtn, { backgroundColor: 'rgba(255,45,122,0.15)' }]}
          onPress={() => setShowFeedbackModal(true)}>
          <Ionicons name="star-outline" size={20} color="#FF2D7A" />
        </TouchableOpacity>
        {/* ✅ Flag = Report */}
        <TouchableOpacity style={[styles.callBtn, { backgroundColor: 'rgba(255,45,122,0.15)' }]}
          onPress={() => setShowReportModal(true)}>
          <Ionicons name="flag-outline" size={20} color="#FF2D7A" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 20, flexGrow: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <View style={[styles.emptyIconWrap, { backgroundColor: 'rgba(255,45,122,0.1)' }]}>
              <Ionicons name="heart" size={36} color="#FF2D7A" />
            </View>
            <Text style={[styles.emptyText, { color: colors.text, fontFamily: FONTS.bold }]}>
              You matched with {DEMO_OTHER_USER.name}!
            </Text>
            <Text style={[styles.emptySubText, { color: colors.subtext, fontFamily: FONTS.regular }]}>
              Start the conversation below 👇
            </Text>
          </View>
        }
      />

      {/* Icebreakers */}
      {showIcebreakers && (
        <View style={[styles.icebreakerSection, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.icebreakerHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
              <Ionicons name="sparkles" size={14} color="#FF2D7A" />
            </View>
            <Text style={[styles.icebreakerTitle, { color: colors.text, fontFamily: FONTS.semibold }]}>AI Icebreakers</Text>
            {loadingIce && <ActivityIndicator size="small" color="#FF2D7A" />}
          </View>
          <View style={styles.icebreakerChips}>
            {icebreakers.map((ice, i) => (
              <TouchableOpacity key={i} style={[styles.icebreakerChip, { borderColor: colors.border, backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]} onPress={() => sendMessage(ice)}>
                <Text style={[styles.icebreakerText, { color: colors.text, fontFamily: FONTS.regular }]}>{ice}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Smart Replies */}
      {smartReplies.length > 0 && (
        <View style={[styles.smartReplySection, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.smartReplyChips}>
            {smartReplies.map((reply, i) => (
              <TouchableOpacity key={i} style={[styles.smartReplyChip, { borderColor: '#FF2D7A', backgroundColor: 'rgba(255,45,122,0.1)' }]} onPress={() => sendMessage(reply)}>
                <Text style={[styles.smartReplyText, { fontFamily: FONTS.medium }]}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input Row */}
      <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {isRecording ? (
          <View style={styles.recordingRow}>
            <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={[styles.recordingText, { fontFamily: FONTS.medium }]}>
              Recording... {recordingDuration}s
            </Text>
            <TouchableOpacity style={styles.stopRecordBtn} onPress={stopRecording}>
              <Ionicons name="stop" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.micBtn, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}
              onPress={startRecording}
            >
              <Ionicons name="mic" size={20} color="#FF2D7A" />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: colors.text, fontFamily: FONTS.regular }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.subtext}
              value={inputText}
              onChangeText={setInputText}
              multiline
              blurOnSubmit={false}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
              onFocus={() => setTimeout(() => flatListRef.current?.scrollToEnd(), 300)}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: inputText.trim() ? '#FF2D7A' : (isDark ? '#2a2a2a' : '#e0e0e0') }]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color={inputText.trim() ? '#fff' : colors.subtext} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ✅ Report Modal */}
      <Modal visible={showReportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            {reportDone ? (
              <View style={styles.reportSuccess}>
                <Ionicons name="checkmark-circle" size={60} color="#4ade80" />
                <Text style={[styles.reportSuccessText, { color: colors.text, fontFamily: FONTS.bold }]}>Report Submitted! ✅</Text>
                <Text style={[{ color: colors.subtext, fontFamily: FONTS.regular, textAlign: 'center' }]}>We'll review this report soon.</Text>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text, fontFamily: FONTS.bold }]}>🚩 Report User</Text>
                  <TouchableOpacity onPress={() => { setShowReportModal(false); setSelectedReason(''); }}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <Text style={[{ color: colors.subtext, fontFamily: FONTS.regular, marginBottom: 8 }]}>
                  Select a reason for reporting {DEMO_OTHER_USER.name}:
                </Text>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonBtn, { borderColor: selectedReason === reason ? '#FF2D7A' : colors.border },
                      selectedReason === reason && { backgroundColor: 'rgba(255,45,122,0.1)' }]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Ionicons name={selectedReason === reason ? "radio-button-on" : "radio-button-off"} size={20}
                      color={selectedReason === reason ? '#FF2D7A' : colors.subtext} />
                    <Text style={[styles.reasonText, { color: selectedReason === reason ? '#FF2D7A' : colors.text, fontFamily: FONTS.medium }]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.submitBtn, { opacity: selectedReason ? 1 : 0.4 }]}
                  onPress={submitReport}
                  disabled={!selectedReason || reportSubmitting}
                >
                  {reportSubmitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={[styles.submitBtnText, { fontFamily: FONTS.bold }]}>Submit Report</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowReportModal(false); setSelectedReason(''); }}>
                  <Text style={[{ color: colors.subtext, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 8 }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ✅ Feedback Modal */}
      <Modal visible={showFeedbackModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: FONTS.bold }]}>⭐ Rate Your Date</Text>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[{ color: colors.subtext, fontFamily: FONTS.regular, marginBottom: 12 }]}>
              How was your conversation with {DEMO_OTHER_USER.name}?
            </Text>
            {/* Star Rating */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)}>
                  <Ionicons name={feedbackRating >= star ? "star" : "star-outline"} size={36}
                    color={feedbackRating >= star ? '#FFD700' : colors.subtext} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.feedbackInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, fontFamily: FONTS.regular }]}
              placeholder="Share your experience... (optional)"
              placeholderTextColor={colors.subtext}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={submitFeedback}>
              <Text style={[styles.submitBtnText, { fontFamily: FONTS.bold }]}>Submit Feedback ⭐</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <Text style={[{ color: colors.subtext, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 8 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 52, borderBottomWidth: 1, gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  onlineText: { fontSize: 12 },
  callBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emptyChat: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyText: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubText: { fontSize: 14, textAlign: 'center' },
  icebreakerSection: { padding: 14, borderTopWidth: 1, gap: 10 },
  icebreakerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  glossIconWrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  icebreakerTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  icebreakerChips: { gap: 8 },
  icebreakerChip: { borderRadius: 12, padding: 10, borderWidth: 1 },
  icebreakerText: { fontSize: 13 },
  smartReplySection: { paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: 1 },
  smartReplyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smartReplyChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  smartReplyText: { fontSize: 12, color: '#FF2D7A' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, gap: 8 },
  micBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  recordingRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF2D7A' },
  recordingText: { flex: 1, color: '#FF2D7A', fontSize: 14 },
  stopRecordBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FF2D7A', alignItems: 'center', justifyContent: 'center' },
  messageRow: { flexDirection: 'row', marginBottom: 8 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#FF2D7A', borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  voiceBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: '75%' },
  voiceBubbleMe: { backgroundColor: '#FF2D7A' },
  voiceBubbleOther: { borderBottomLeftRadius: 4 },
  voiceWave: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, height: 30 },
  waveBar: { width: 3, borderRadius: 2 },
  voiceDuration: { fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 14, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  reasonBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  reasonText: { fontSize: 15 },
  submitBtn: { backgroundColor: '#FF2D7A', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  reportSuccess: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  reportSuccessText: { fontSize: 20, fontWeight: '700' },
  feedbackInput: { borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
});