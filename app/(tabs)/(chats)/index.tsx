import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, TextInput, Modal, Platform, Alert } from "react-native";
import React, { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import { useRouter, useFocusEffect } from "expo-router";
import { auth, db } from "@/constants/appwrite";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "@/constants/ThemeContext";
import { FONTS } from "@/constants/fonts";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

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

export default function Chats() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      const currentUid = auth.currentUser?.uid;
      if (currentUid) loadChats(currentUid);
      else setLoading(false);
    }, [])
  );

  const loadChats = async (currentUid: string) => {
    setLoading(true);
    try {
      const userSnap = await getDoc(doc(db, 'users', currentUid));
      if (!userSnap.exists()) { setLoading(false); return; }
      const userData = userSnap.data();
      const matches = (userData.matches || []).filter((m: string) => m && m.trim() !== '');
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
          const hoursDiff = (new Date().getTime() - chatData.lastMessageAt.toDate().getTime()) / (1000 * 60 * 60);
          if (hoursDiff > 24) ghostingWarning = true;
        }

        chatItems.push({
          id: chatId,
          otherUserId: matchId,
          otherUserName: matchData.name || 'Unknown',
          otherUserImage: matchData.photo || matchData.image || 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg',
          lastMessage: chatData.lastMessage || 'Say hello!',
          streak: chatData.streak || 0,
          ghostingWarning,
          lastMessageAt: chatData.lastMessageAt,
        });
      }

      setChats(chatItems);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const getTimerText = (lastMessageAt: any) => {
    if (!lastMessageAt) return 'Start chatting!';
    const hours = Math.floor((new Date().getTime() - lastMessageAt.toDate().getTime()) / (1000 * 60 * 60));
    if (hours < 24) return `${24 - hours}h remaining`;
    return 'Reply now!';
  };

  const getTimerColor = (chat: ChatItem) => {
    if (chat.ghostingWarning) return '#FF5722';
    return '#4CAF50';
  };

  const getTimerIcon = (chat: ChatItem) => {
    if (chat.ghostingWarning) return 'warning';
    return 'timer-outline';
  };

  // ✅ Filter + Search logic
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.otherUserName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'ghosting') return matchesSearch && chat.ghostingWarning;
    if (activeFilter === 'streak') return matchesSearch && chat.streak > 0;
    return matchesSearch;
  });

  const FILTERS = [
    { id: 'all', label: 'All Chats', icon: 'chatbubbles-outline' },
    { id: 'ghosting', label: 'Needs Reply', icon: 'warning-outline' },
    { id: 'streak', label: 'On Streak 🔥', icon: 'flame-outline' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={{ paddingHorizontal: 20, gap: 16 }}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerSub, { color: colors.subtext, fontFamily: FONTS.medium }]}>MESSAGES</Text>
              <Text style={[styles.headerTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Chats</Text>
            </View>
            <View style={styles.headerRight}>
              {/* ✅ Search button */}
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: showSearch ? '#FF2D7A' : colors.card, borderColor: showSearch ? '#FF2D7A' : colors.border }]}
                onPress={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
              >
                <Ionicons name="search" size={20} color={showSearch ? '#fff' : colors.text} />
              </TouchableOpacity>
              {/* ✅ Filter button */}
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: activeFilter !== 'all' ? '#FF2D7A' : colors.card, borderColor: activeFilter !== 'all' ? '#FF2D7A' : colors.border }]}
                onPress={() => setShowFilter(true)}
              >
                <Ionicons name="filter" size={20} color={activeFilter !== 'all' ? '#fff' : colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ✅ Search Bar */}
          {showSearch && (
            <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={16} color={colors.subtext} />
              <TextInput
                style={[styles.searchInput, { color: colors.text, fontFamily: FONTS.regular }]}
                placeholder="Search chats..."
                placeholderTextColor={colors.subtext}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={colors.subtext} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ✅ Active filter badge */}
          {activeFilter !== 'all' && (
            <TouchableOpacity
              style={styles.activeFilterBadge}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={[styles.activeFilterText, { fontFamily: FONTS.medium }]}>
                {FILTERS.find(f => f.id === activeFilter)?.label} ✕
              </Text>
            </TouchableOpacity>
          )}

          {/* Loading */}
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#FF2D7A" />
              <Text style={[styles.loadingText, { color: colors.subtext, fontFamily: FONTS.regular }]}>Loading chats...</Text>
            </View>
          ) : filteredChats.length === 0 ? (
            <View style={styles.centered}>
              <View style={[styles.emptyIconWrap, { backgroundColor: 'rgba(255,45,122,0.1)' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#FF2D7A" />
              </View>
              <Text style={[styles.emptyText, { color: colors.text, fontFamily: FONTS.bold }]}>
                {searchQuery ? 'No results found!' : 'No matches yet!'}
              </Text>
              <Text style={[styles.emptySubText, { color: colors.subtext, fontFamily: FONTS.regular }]}>
                {searchQuery ? 'Try a different name' : 'Swipe right to match with someone'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity style={styles.swipeBtn} onPress={() => router.push('/(tabs)/people')}>
                  <Ionicons name="heart" size={16} color="#fff" />
                  <Text style={[styles.swipeBtnText, { fontFamily: FONTS.semibold }]}>Start Swiping</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {filteredChats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  style={[
                    styles.chatItem,
                    { backgroundColor: colors.card, borderColor: chat.ghostingWarning ? '#FF5722' : colors.border }
                  ]}
                  onPress={() => router.push('/charscreenf')}
                >
                  <View style={styles.avatarContainer}>
                    <Avatar size={54} image={chat.otherUserImage} />
                    {chat.streak > 0 && (
                      <View style={styles.streakBadge}>
                        <Ionicons name="flame" size={10} color="#FF6B00" />
                        <Text style={[styles.streakText, { fontFamily: FONTS.bold }]}>{chat.streak}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                      <Text style={[styles.chatName, { color: colors.text, fontFamily: FONTS.semibold }]}>
                        {chat.otherUserName}
                      </Text>
                      <View style={styles.timerRow}>
                        <Ionicons name={getTimerIcon(chat) as any} size={12} color={getTimerColor(chat)} />
                        <Text style={[styles.timerText, { color: getTimerColor(chat), fontFamily: FONTS.medium }]}>
                          {getTimerText(chat.lastMessageAt)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.lastMessage, { color: colors.subtext, fontFamily: FONTS.regular }]} numberOfLines={1}>
                      {chat.lastMessage}
                    </Text>
                    {chat.ghostingWarning && (
                      <View style={styles.ghostingRow}>
                        <Ionicons name="alert-circle" size={12} color="#FF5722" />
                        <Text style={[styles.ghostingText, { fontFamily: FONTS.medium }]}>Don't ghost! Reply to keep your streak</Text>
                      </View>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ✅ Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Filter Chats</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterItem,
                  { borderColor: activeFilter === filter.id ? '#FF2D7A' : colors.border },
                  activeFilter === filter.id && { backgroundColor: 'rgba(255,45,122,0.1)' }
                ]}
                onPress={() => { setActiveFilter(filter.id); setShowFilter(false); }}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={20}
                  color={activeFilter === filter.id ? '#FF2D7A' : colors.subtext}
                />
                <Text style={[styles.filterText, { color: activeFilter === filter.id ? '#FF2D7A' : colors.text, fontFamily: FONTS.medium }]}>
                  {filter.label}
                </Text>
                {activeFilter === filter.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#FF2D7A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
  headerSub: { fontSize: 11, letterSpacing: 1.5 },
  headerTitle: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  activeFilterBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,45,122,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#FF2D7A' },
  activeFilterText: { color: '#FF2D7A', fontSize: 13 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14, marginTop: 8 },
  emptyIconWrap: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyText: { fontSize: 20, fontWeight: '700' },
  emptySubText: { fontSize: 14 },
  swipeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FF2D7A', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, marginTop: 8 },
  swipeBtnText: { color: '#fff', fontSize: 14 },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1, gap: 12 },
  avatarContainer: { position: 'relative' },
  streakBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 2, borderWidth: 1, borderColor: '#2a2a2a' },
  streakText: { fontSize: 10, color: '#FF6B00' },
  chatInfo: { flex: 1, gap: 4 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { fontSize: 15, fontWeight: '600' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerText: { fontSize: 11, fontWeight: '500' },
  lastMessage: { fontSize: 13 },
  ghostingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ghostingText: { fontSize: 11, color: '#FF5722' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 14, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  filterItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  filterText: { flex: 1, fontSize: 15 },
});