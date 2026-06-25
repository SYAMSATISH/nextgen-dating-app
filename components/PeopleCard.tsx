import { fetchUsersFromFirebase, getCompatibilityScore, User } from "@/DB/userDB";
import { db } from "@/constants/appwrite";
import { Ionicons } from "@expo/vector-icons";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions, ImageBackground, StyleSheet,
  Text, View, ActivityIndicator, TouchableOpacity,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import * as Location from 'expo-location';
import { useTheme } from "@/constants/ThemeContext";
import { FONTS } from "@/constants/fonts";

const { width, height } = Dimensions.get("window");
const CURRENT_USER_ID = "Ao5bEhPi8nfSUhu1rH79goZ4Bjs1";
const CURRENT_USER = { name: "Ravi Kumar", intent: "relationship", bio: "Software developer from Hyderabad", age: 26 };

const PeopleCard = ({ selectedMood, activeTab }: { selectedMood?: string; activeTab?: string }) => {
  const { colors, isDark } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<{ [key: string]: { score: number; reason: string } }>({});
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<any>(null);
  const currentTab = activeTab || 'foryou';

  useEffect(() => {
    if (currentTab === 'nearby') {
      loadNearbyUsers();
    } else {
      loadUsers();
    }
  }, [selectedMood, activeTab]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const loadNearbyUsers = async () => {
    setNearbyLoading(true);
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        loadUsers();
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const fetchedUsers = await fetchUsersFromFirebase();
      let otherUsers = fetchedUsers.filter(u => u.id !== CURRENT_USER_ID);
      const nearbyUsers = otherUsers.filter(u => {
        const userLoc = (u as any).location;
        if (!userLoc?.lat || !userLoc?.lng) return false;
        const distance = getDistance(latitude, longitude, userLoc.lat, userLoc.lng);
        return distance <= 50;
      });
      const finalUsers = nearbyUsers.length > 0 ? nearbyUsers : otherUsers;
      setUsers(finalUsers);
      const scoreMap: any = {};
      for (const user of finalUsers) {
        scoreMap[user.id] = getCompatibilityScore(CURRENT_USER, user);
      }
      setScores(scoreMap);
    } catch (error) {
      loadUsers();
    }
    setLoading(false);
    setNearbyLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    const fetchedUsers = await fetchUsersFromFirebase();
    let otherUsers = fetchedUsers.filter(u => u.id !== CURRENT_USER_ID);
    if (selectedMood) {
      const filtered = otherUsers.filter(u => (u as any).currentMood === selectedMood);
      if (filtered.length > 0) otherUsers = filtered;
    }
    setUsers(otherUsers);
    setLoading(false);
    const scoreMap: any = {};
    for (const user of otherUsers) {
      scoreMap[user.id] = getCompatibilityScore(CURRENT_USER, user);
    }
    setScores(scoreMap);
  };

  const handleSwipeRight = async (cardIndex: number) => {
    const likedUser = users[cardIndex];
    if (!likedUser) return;
    setCurrentIndex(cardIndex + 1);
    try {
      await updateDoc(doc(db, "users", CURRENT_USER_ID), {
        liked: arrayUnion(likedUser.id),
      });
    } catch (error) {
      console.error("Like save error:", error);
    }
  };

  const handleSwipeLeft = (cardIndex: number) => {
    setCurrentIndex(cardIndex + 1);
  };

  const handleLike = () => {
    swiperRef.current?.swipeRight();
  };

  const handleDislike = () => {
    swiperRef.current?.swipeLeft();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF2D7A" />
        <Text style={[styles.loadingText, { color: colors.subtext, fontFamily: FONTS.regular }]}>
          {nearbyLoading ? '📍 Finding people near you...' : 'Finding your matches...'}
        </Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 48 }}>{currentTab === 'nearby' ? '📍' : '💔'}</Text>
        <Text style={[styles.loadingText, { color: colors.subtext, fontFamily: FONTS.regular }]}>
          {currentTab === 'nearby' ? 'No one nearby!' : 'No more profiles!'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentTab === 'nearby' && (
        <View style={[styles.nearbyBanner, { backgroundColor: 'rgba(255,45,122,0.1)', borderColor: '#FF2D7A' }]}>
          <Ionicons name="location" size={14} color="#FF2D7A" />
          <Text style={[styles.nearbyText, { color: '#FF2D7A', fontFamily: FONTS.medium }]}>
            Showing people within 50km
          </Text>
        </View>
      )}

      {/* Swiper */}
      <Swiper
        ref={swiperRef}
        cards={users}
        renderCard={(card) => {
          const score = scores[card.id];
          return (
            <View style={styles.card}>
              <ImageBackground
                source={{ uri: (card as any).photo || card.image }}
                style={styles.image}
                imageStyle={styles.imageStyle}
              >
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>● PREMIUM</Text>
                </View>
                {currentTab === 'nearby' && (
                  <View style={styles.nearbyBadge}>
                    <Ionicons name="location" size={12} color="#fff" />
                    <Text style={styles.nearbyBadgeText}>Nearby</Text>
                  </View>
                )}
                <View style={styles.infoSection}>
                  <View style={styles.nameRow}>
                    <Text style={styles.nameText}>{card.name}, {card.age}</Text>
                  </View>
                  <Text style={styles.locationText}>📍 India</Text>
                  <View style={styles.statsRow}>
                    {score && (
                      <View style={styles.statChip}>
                        <Text style={styles.statText}>❤️ {score.score}%</Text>
                      </View>
                    )}
                    {card.bio && (
                      <View style={styles.statChip}>
                        <Text style={styles.statText}>💬 {card.bio.slice(0, 15)}...</Text>
                      </View>
                    )}
                  </View>
                </View>
              </ImageBackground>
            </View>
          );
        }}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={handleSwipeLeft}
        infinite={false}
        backgroundColor="transparent"
        cardVerticalMargin={0}
        stackSize={3}
        overlayLabels={{
          left: {
            title: 'NOPE',
            style: {
              label: { color: 'red', fontSize: 32, fontWeight: '800', borderColor: 'red', borderWidth: 3, borderRadius: 8, padding: 8 },
              wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 40, marginLeft: -20 },
            },
          },
          right: {
            title: 'LIKE',
            style: {
              label: { color: '#FF2D7A', fontSize: 32, fontWeight: '800', borderColor: '#FF2D7A', borderWidth: 3, borderRadius: 8, padding: 8 },
              wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 40, marginLeft: 20 },
            },
          },
        }}
        disableTopSwipe
        disableBottomSwipe
      />

      {/* Action buttons — Swiper baata */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtnGrey} onPress={handleDislike}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnStar}>
          <Ionicons name="star" size={24} color="#FFD700" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnPink} onPress={handleLike}>
          <Ionicons name="heart" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PeopleCard;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingText: { fontSize: 16, fontWeight: '500' },
  nearbyBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginBottom: 8 },
  nearbyText: { fontSize: 12 },
  card: { width: width * 0.92, height: height * 0.58, borderRadius: 24, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  image: { width: '100%', height: '100%', justifyContent: 'space-between' },
  imageStyle: { borderRadius: 24 },
  premiumBadge: { alignSelf: 'flex-start', margin: 16, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  premiumText: { color: '#FFD700', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  nearbyBadge: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF2D7A', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  nearbyBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  infoSection: { padding: 20, paddingBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nameText: { fontSize: 26, fontWeight: '700', color: '#fff' },
  locationText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  statChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingVertical: 16 },
  actionBtnGrey: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  actionBtnStar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFD700' },
  actionBtnPink: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF2D7A', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF2D7A', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 12 },
});