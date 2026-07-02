import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, rtdb } from '@/constants/appwrite';
import { ref, push, onValue, off } from 'firebase/database';
import { useTheme } from '@/constants/ThemeContext';
import { FONTS } from '@/constants/fonts';

const BASE_URL = 'https://sanded-livable-salary.ngrok-free.dev';
const ICEBREAKER_API = `${BASE_URL}/api/icebreakers`;
const SMART_REPLY_API = `${BASE_URL}/api/smart-reply`;
const NUDGE_API = `${BASE_URL}/api/nudge-check`;

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
};

const DEMO_OTHER_USER = {
  id: 'demo_user',
  name: 'Priya Sharma',
  image: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg',
};

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
  const [loadingReply, setLoadingReply] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(true);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);

  const chatId = [currentUid, DEMO_OTHER_USER.id].sort().join('_');

  useEffect(() => {
    loadIcebreakers();
    checkNudge();
    if (Platform.OS !== 'web') loadMessages();
    return () => {
      const chatRef = ref(rtdb, `chats/${chatId}/messages`);
      off(chatRef);
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
      const response = await fetch(ICEBREAKER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1Name: 'You',
          user2Name: DEMO_OTHER_USER.name,
          user1Interests: ['coding', 'travel'],
          user2Interests: ['music', 'coffee'],
        }),
      });
      const data = await response.json();
      setIcebreakers(data.icebreakers || []);
    } catch (error) {
      setIcebreakers([
        "What's your favorite weekend activity? 🌟",
        "If you could travel anywhere, where would you go? ✈️",
        "What's the last show you binge-watched? 📺",
      ]);
    }
    setLoadingIce(false);
  };

  const checkNudge = async () => {
    try {
      const response = await fetch(NUDGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          lastMessageTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        }),
      });
      const data = await response.json();
      if (data.shouldNudge) setNudgeMessage(data.message);
    } catch (error) {
      console.error('Nudge error:', error);
    }
  };

  const loadSmartReplies = async (lastMessage: string) => {
    setLoadingReply(true);
    try {
      const response = await fetch(SMART_REPLY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: messages.map(m => m.text), lastMessage }),
      });
      const data = await response.json();
      setSmartReplies(data.replies || []);
    } catch (error) {
      setSmartReplies(["That sounds amazing! 😊", "Tell me more about that!", "Haha that's so cool 😄"]);
    }
    setLoadingReply(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      senderId: currentUid,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setShowIcebreakers(false);
    setNudgeMessage('');
    setSmartReplies([]);
    await loadSmartReplies(text);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUid;
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : [styles.bubbleOther, { backgroundColor: colors.card }]]}>
          <Text style={[styles.messageText, isMe ? { color: '#fff' } : { color: colors.text }]}>
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
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text, fontFamily: FONTS.bold }]}>
            {DEMO_OTHER_USER.name}
          </Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.onlineText, { color: colors.subtext, fontFamily: FONTS.regular }]}>Online</Text>
          </View>
        </View>
        {/* ✅ Video Call button — opens modal */}
        <TouchableOpacity
          style={[styles.callBtn, { backgroundColor: 'rgba(255,45,122,0.15)' }]}
          onPress={() => setShowVideoModal(true)}
        >
          <Ionicons name="videocam-outline" size={22} color="#FF2D7A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.callBtn, { backgroundColor: 'rgba(255,45,122,0.15)' }]}
          onPress={() => router.push('/feedback')}
        >
          <Ionicons name="star-outline" size={20} color="#FF2D7A" />
        </TouchableOpacity>
      </View>

      {/* Nudge Banner */}
      {nudgeMessage ? (
        <View style={styles.nudgeBanner}>
          <Text style={styles.nudgeText}>🔥 {nudgeMessage}</Text>
          <TouchableOpacity onPress={() => setNudgeMessage('')}>
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        keyboardShouldPersistTaps="handled"
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
              <TouchableOpacity
                key={i}
                style={[styles.icebreakerChip, { borderColor: colors.border, backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
                onPress={() => sendMessage(ice)}
              >
                <Text style={[styles.icebreakerText, { color: colors.text, fontFamily: FONTS.regular }]}>{ice}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Smart Replies */}
      {smartReplies.length > 0 && (
        <View style={[styles.smartReplySection, { borderTopColor: colors.border }]}>
          {loadingReply ? (
            <ActivityIndicator size="small" color="#FF2D7A" />
          ) : (
            <View style={styles.smartReplyChips}>
              {smartReplies.map((reply, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.smartReplyChip, { borderColor: '#FF2D7A', backgroundColor: 'rgba(255,45,122,0.1)' }]}
                  onPress={() => sendMessage(reply)}
                >
                  <Text style={[styles.smartReplyText, { fontFamily: FONTS.medium }]}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.attachBtn, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
          <Ionicons name="add" size={22} color={colors.subtext} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: colors.text, fontFamily: FONTS.regular }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.subtext}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: inputText.trim() ? '#FF2D7A' : colors.border }]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ✅ Video Call Modal */}
      <Modal visible={showVideoModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: FONTS.bold }]}>
                📹 Video Call
              </Text>
              <TouchableOpacity onPress={() => setShowVideoModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.videoModalContent}>
              <View style={[styles.videoIconWrap, { backgroundColor: 'rgba(255,45,122,0.1)' }]}>
                <Ionicons name="videocam" size={48} color="#FF2D7A" />
              </View>
              <Text style={[styles.videoTitle, { color: colors.text, fontFamily: FONTS.bold }]}>
                Call {DEMO_OTHER_USER.name}?
              </Text>
              <Text style={[styles.videoSub, { color: colors.subtext, fontFamily: FONTS.regular }]}>
                Video calling feature is coming soon! 🚀{'\n'}Stay tuned for updates.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.videoBtn}
              onPress={() => setShowVideoModal(false)}
            >
              <Ionicons name="videocam" size={20} color="#fff" />
              <Text style={[styles.videoBtnText, { fontFamily: FONTS.bold }]}>Notify Me When Ready</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowVideoModal(false)}>
              <Text style={[styles.cancelText, { color: colors.subtext, fontFamily: FONTS.regular }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 80 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 52, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  onlineText: { fontSize: 12 },
  callBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  nudgeBanner: { backgroundColor: '#FF5722', padding: 10, marginHorizontal: 10, marginTop: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nudgeText: { color: 'white', fontWeight: 'bold', fontSize: 13, flex: 1 },
  messagesList: { padding: 16, gap: 8, flexGrow: 1 },
  messageRow: { flexDirection: 'row', marginBottom: 8 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#FF2D7A', borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
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
  smartReplySection: { borderTopWidth: 1, paddingVertical: 10, paddingHorizontal: 14 },
  smartReplyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smartReplyChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  smartReplyText: { fontSize: 12, color: '#FF2D7A' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, gap: 8 },
  attachBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  videoModalContent: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  videoIconWrap: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  videoTitle: { fontSize: 20, fontWeight: '700' },
  videoSub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  videoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF2D7A', paddingVertical: 16, borderRadius: 16 },
  videoBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelText: { textAlign: 'center', fontSize: 14, marginTop: 4 },
});