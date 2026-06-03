import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, rtdb } from '@/constants/appwrite';
import { ref, push, onValue, off } from 'firebase/database';
import { useTheme } from '@/constants/ThemeContext';
import { FONTS } from '@/constants/fonts';
import { Audio } from 'expo-av';

const ICEBREAKER_API = 'https://bookish-guide-qvqjrpjxrvr7h4x9q-8080.app.github.dev/api/icebreakers';
const SMART_REPLY_API = 'https://bookish-guide-qvqjrpjxrvr7h4x9q-8080.app.github.dev/api/smart-reply';

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
  const currentUid = auth.currentUser?.uid || 'current_user';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [loadingIce, setLoadingIce] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(true);

  // Voice recording
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  const chatId = [currentUid, DEMO_OTHER_USER.id].sort().join('_');

  useEffect(() => {
    loadIcebreakers();
    if (Platform.OS !== 'web') loadMessages();
    return () => {
      if (Platform.OS !== 'web') off(ref(rtdb, `chats/${chatId}/messages`));
      sound?.unloadAsync();
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
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  // Voice recording functions
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        alert('Voice messages work on mobile only!');
        return;
      }
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      startPulse();
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

  const playVoiceMessage = async (messageId: string) => {
    if (playingId === messageId) {
      await sound?.stopAsync();
      setPlayingId(null);
      return;
    }
    setPlayingId(messageId);
    setTimeout(() => setPlayingId(null), 3000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUid;

    if (item.type === 'voice') {
      return (
        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
          <TouchableOpacity
            style={[styles.voiceBubble, isMe ? styles.voiceBubbleMe : [styles.voiceBubbleOther, { backgroundColor: colors.card }]]}
            onPress={() => playVoiceMessage(item.id)}
          >
            <Ionicons
              name={playingId === item.id ? "pause" : "play"}
              size={20}
              color={isMe ? '#fff' : '#FF2D7A'}
            />
            <View style={[styles.voiceWave, { backgroundColor: isMe ? 'rgba(255,255,255,0.4)' : 'rgba(255,45,122,0.3)' }]}>
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: Math.random() * 16 + 6,
                      backgroundColor: isMe ? '#fff' : '#FF2D7A',
                      opacity: playingId === item.id ? 1 : 0.6,
                    }
                  ]}
                />
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

  const Footer = () => (
    <View>
      {showIcebreakers && (
        <View style={[styles.icebreakerSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.icebreakerHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
              <Ionicons name="sparkles" size={14} color="#FF2D7A" />
            </View>
            <Text style={[styles.icebreakerTitle, { color: colors.text, fontFamily: FONTS.semibold }]}>AI Icebreakers</Text>
            {loadingIce && <ActivityIndicator size="small" color="#FF2D7A" />}
          </View>
          {icebreakers.map((ice, i) => (
            <TouchableOpacity key={i} style={[styles.icebreakerChip, { borderColor: colors.border, backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]} onPress={() => sendMessage(ice)}>
              <Text style={[styles.icebreakerText, { color: colors.text, fontFamily: FONTS.regular }]}>{ice}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {smartReplies.length > 0 && (
        <View style={[styles.smartReplySection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.smartReplyChips}>
            {smartReplies.map((reply, i) => (
              <TouchableOpacity key={i} style={[styles.smartReplyChip, { borderColor: '#FF2D7A', backgroundColor: 'rgba(255,45,122,0.1)' }]} onPress={() => sendMessage(reply)}>
                <Text style={[styles.smartReplyText, { fontFamily: FONTS.medium }]}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input Row with Voice */}
      <View style={[styles.inputRow, { backgroundColor: '#1a1a1a', borderTopColor: colors.border, marginBottom: Platform.OS === 'web' ? 84 : 130 }]}>
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
            <TouchableOpacity style={styles.attachBtn} onPress={startRecording}>
              <Ionicons name="mic" size={22} color="#FF2D7A" />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { color: '#fff', fontFamily: FONTS.regular }]}
              placeholder="Type a message..."
              placeholderTextColor="#555"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: inputText.trim() ? '#FF2D7A' : '#2a2a2a' }]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <TouchableOpacity style={[styles.callBtn, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
          <Ionicons name="videocam-outline" size={22} color="#FF2D7A" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.callBtn, { backgroundColor: 'rgba(255,45,122,0.15)' }]} onPress={() => router.push('/feedback')}>
          <Ionicons name="star-outline" size={20} color="#FF2D7A" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, flexGrow: 1, paddingBottom: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={<Footer />}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 52, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  onlineText: { fontSize: 12 },
  callBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  messageRow: { flexDirection: 'row', marginBottom: 8 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#FF2D7A', borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  voiceBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: '75%' },
  voiceBubbleMe: { backgroundColor: '#FF2D7A', borderBottomRightRadius: 4 },
  voiceBubbleOther: { borderBottomLeftRadius: 4 },
  voiceWave: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, height: 30 },
  waveBar: { width: 3, borderRadius: 2 },
  voiceDuration: { fontSize: 11 },
  emptyChat: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyText: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubText: { fontSize: 14, textAlign: 'center' },
  icebreakerSection: { padding: 14, borderWidth: 1, borderRadius: 12, margin: 8, gap: 8 },
  icebreakerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  glossIconWrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  icebreakerTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  icebreakerChip: { borderRadius: 12, padding: 10, borderWidth: 1, marginBottom: 6 },
  icebreakerText: { fontSize: 13 },
  smartReplySection: { paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderRadius: 12, margin: 8 },
  smartReplyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smartReplyChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  smartReplyText: { fontSize: 12, color: '#FF2D7A' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, gap: 8, borderRadius: 12, margin: 8 },
  attachBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100, backgroundColor: '#2a2a2a' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  recordingRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF2D7A' },
  recordingText: { flex: 1, color: '#FF2D7A', fontSize: 14 },
  stopRecordBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FF2D7A', alignItems: 'center', justifyContent: 'center' },
});