import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import { useRouter, useFocusEffect } from "expo-router";
import { auth, db } from "@/constants/appwrite";
import { doc, getDoc } from "firebase/firestore";

type ChatItem = {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserImage: string;
  lastMessage: string;
  streak: number;
  ghostingWarning: boolean;
  lastMessageAt: any;
};

const Chats = () => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const button = () => <AntDesign name="search1" size={24} color="black" />;

  useFocusEffect(
    useCallback(() => {
      console.log('Chats screen focused');
      console.log('Auth user:', auth.currentUser?.uid);
      const currentUid = auth.currentUser?.uid;
      if (currentUid) {
        loadChats(currentUid);
      } else {
        setLoading(false);
      }
    }, [])
  );

  const loadChats = async (currentUid: string) => {
    console.log('loadChats called with:', currentUid);
    setLoading(true);
    try {
      const userSnap = await getDoc(doc(db, 'users', currentUid));
      if (!userSnap.exists()) {
        console.log('User doc not found');
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      console.log('Matches array:', userData.matches);

      const matches = (userData.matches || []).filter(
        (m: string) => m && m.trim() !== ''
      );
      console.log('Filtered matches:', matches);

      const chatItems: ChatItem[] = [];
      for (const matchId of matches) {
        const matchSnap = await getDoc(doc(db, 'users', matchId));
        if (!matchSnap.exists()) continue;
        const matchData = matchSnap.data();

        const chatId = [currentUid, matchId].sort().join('_');
        const chatSnap = await getDoc(doc(db, 'chats', chatId));
        const chatData = chatSnap.exists() ? chatSnap.data() : {};

        let ghostingWarning = false;
        if (chatData.lastMessageAt) {
          const lastMsg = chatData.lastMessageAt.toDate();
          const hoursDiff = (new Date().getTime() - lastMsg.getTime()) / (1000 * 60 * 60);
          if (hoursDiff > 24) ghostingWarning = true;
        }

        chatItems.push({
          id: chatId,
          otherUserId: matchId,
          otherUserName: matchData.name || 'Unknown',
          otherUserImage: matchData.photo || matchData.image || 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400',
          lastMessage: chatData.lastMessage || 'Say hello! 👋',
          streak: chatData.streak || 0,
          ghostingWarning,
          lastMessageAt: chatData.lastMessageAt,
        });
      }

      console.log('Final chat items:', chatItems.length);
      setChats(chatItems);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const getTimerText = (lastMessageAt: any) => {
    if (!lastMessageAt) return '⏰ Start chatting!';
    const hours = Math.floor(
      (new Date().getTime() - lastMessageAt.toDate().getTime()) / (1000 * 60 * 60)
    );
    if (hours < 24) return `⏰ ${24 - hours}h remaining`;
    return '⚠️ Reply now!';
  };

  return (
    <ScrollView style={{ paddingHorizontal: 8 }}>
      <View style={{ gap: 10 }}>
        <Header headerTitle={"Chats"} button={button} />
        <View style={styles.headerSection}>
          <Text style={styles.logo}>Chats</Text>
          <MaterialCommunityIcons name="sort-variant" size={24} color="black" />
        </View>

        {loading ? (
          <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
            Loading chats...
          </Text>
        ) : chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matches yet!</Text>
            <Text style={styles.emptySubText}>Swipe right to match with someone 💕</Text>
          </View>
        ) : (
          chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[styles.chatItem, chat.ghostingWarning && styles.ghostingWarning]}
              onPress={() => router.push('/charscreenf')}
            >
              <View style={styles.avatarContainer}>
                <Avatar size={56} image={chat.otherUserImage} />
                {chat.streak > 0 && (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>🔥{chat.streak}</Text>
                  </View>
                )}
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{chat.otherUserName}</Text>
                  <Text style={[styles.timerText, chat.ghostingWarning && styles.warningText]}>
                    {getTimerText(chat.lastMessageAt)}
                  </Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                {chat.ghostingWarning && (
                  <Text style={styles.ghostingText}>⚠️ Don't ghost! Reply to keep your streak</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default Chats;

const styles = StyleSheet.create({
  headerSection: { justifyContent: 'space-between', flexDirection: 'row', paddingVertical: 8, marginBottom: 6 },
  logo: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1, color: '#1a1a1a' },
  emptyContainer: { alignItems: 'center', marginTop: 40, gap: 8 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubText: { fontSize: 14, color: '#888' },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: '#fff', marginBottom: 8, borderWidth: 1, borderColor: '#f0f0f0', gap: 12 },
  ghostingWarning: { borderColor: '#FF5722', backgroundColor: '#FFF3E0' },
  avatarContainer: { position: 'relative' },
  streakBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 1, borderWidth: 1, borderColor: '#f0f0f0' },
  streakText: { fontSize: 11, fontWeight: 'bold' },
  chatInfo: { flex: 1, gap: 4 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  timerText: { fontSize: 12, color: '#4CAF50', fontWeight: '500' },
  warningText: { color: '#FF5722' },
  lastMessage: { fontSize: 14, color: '#888' },
  ghostingText: { fontSize: 12, color: '#FF5722', fontWeight: '500' },
});