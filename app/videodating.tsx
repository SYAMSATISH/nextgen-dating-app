import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/ThemeContext';
import { FONTS } from '@/constants/fonts';

const SPEED_DATE_DURATION = 180; // 3 minutes

const DEMO_PROFILES = [
  { id: '1', name: 'Priya Sharma', age: 23, bio: 'Coffee lover & traveler ✈️', location: 'Hyderabad' },
  { id: '2', name: 'Ananya Reddy', age: 25, bio: 'Dancer & foodie 🍕', location: 'Bangalore' },
  { id: '3', name: 'Kavya Nair', age: 22, bio: 'Bookworm & artist 🎨', location: 'Chennai' },
  { id: '4', name: 'Meera Iyer', age: 24, bio: 'Fitness freak & chef 🍳', location: 'Mumbai' },
];

export default function VideoDating() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SPEED_DATE_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const timerRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Animated.timing(progressAnim, {
        toValue: 0,
        duration: timeLeft * 1000,
        useNativeDriver: false,
      }).start();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const handleTimeUp = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    Alert.alert('⏰ Time Up!', 'Do you want to Like or Skip?', [
      { text: '❤️ Like', onPress: () => handleLike() },
      { text: '👋 Skip', onPress: () => handleSkip() },
    ]);
  };

  const handleLike = () => {
    const current = DEMO_PROFILES[currentIndex];
    setLiked(prev => [...prev, current.id]);
    Alert.alert('💘 It\'s a Match!', `You and ${current.name} liked each other!`, [
      { text: 'Start Chatting', onPress: () => router.push('/charscreenf') },
      { text: 'Next Person', onPress: () => moveNext() },
    ]);
  };

  const handleSkip = () => {
    const current = DEMO_PROFILES[currentIndex];
    setSkipped(prev => [...prev, current.id]);
    moveNext();
  };

  const moveNext = () => {
    if (currentIndex >= DEMO_PROFILES.length - 1) {
      setSessionDone(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setTimeLeft(SPEED_DATE_DURATION);
    setIsActive(false);
    progressAnim.setValue(1);
  };

  const startSession = () => {
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentProfile = DEMO_PROFILES[currentIndex];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getTimerColor = () => {
    if (timeLeft > 60) return '#4ade80';
    if (timeLeft > 30) return '#FFD700';
    return '#FF2D7A';
  };

  if (sessionDone) {
    return (
      <View style={[styles.container, { backgroundColor: '#0a0a0a' }]}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={[styles.doneTitle, { fontFamily: FONTS.bold }]}>Session Complete!</Text>
          <Text style={[styles.doneSub, { fontFamily: FONTS.regular }]}>
            You met {DEMO_PROFILES.length} people today
          </Text>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
              <Ionicons name="heart" size={28} color="#FF2D7A" />
              <Text style={[styles.statNum, { fontFamily: FONTS.bold }]}>{liked.length}</Text>
              <Text style={[styles.statLabel, { fontFamily: FONTS.regular }]}>Liked</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255,107,0,0.15)' }]}>
              <Ionicons name="people" size={28} color="#FF6B00" />
              <Text style={[styles.statNum, { fontFamily: FONTS.bold }]}>{DEMO_PROFILES.length}</Text>
              <Text style={[styles.statLabel, { fontFamily: FONTS.regular }]}>Met</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(74,222,128,0.15)' }]}>
              <Ionicons name="flash" size={28} color="#4ade80" />
              <Text style={[styles.statNum, { fontFamily: FONTS.bold }]}>{liked.length}</Text>
              <Text style={[styles.statLabel, { fontFamily: FONTS.regular }]}>Matches</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={[styles.doneBtnText, { fontFamily: FONTS.bold }]}>Back to App</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#0a0a0a' }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { fontFamily: FONTS.bold }]}>⚡ Speed Dating</Text>
          <Text style={[styles.headerSub, { fontFamily: FONTS.regular }]}>
            {currentIndex + 1} of {DEMO_PROFILES.length}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Timer */}
      <View style={styles.timerSection}>
        <Text style={[styles.timerText, { color: getTimerColor(), fontFamily: FONTS.bold }]}>
          {formatTime(timeLeft)}
        </Text>
        <View style={styles.progressBarOuter}>
          <Animated.View style={[styles.progressBarInner, { width: progressWidth, backgroundColor: getTimerColor() }]} />
        </View>
      </View>

      {/* Video Area */}
      <Animated.View style={[styles.videoArea, { transform: [{ scale: pulseAnim }] }]}>
        {/* Fake video stream */}
        <View style={styles.videoPlaceholder}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={60} color="#FF2D7A" />
          </View>
          {isActive && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={[styles.liveText, { fontFamily: FONTS.bold }]}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Profile info overlay */}
        <View style={styles.profileOverlay}>
          <Text style={[styles.profileName, { fontFamily: FONTS.bold }]}>
            {currentProfile.name}, {currentProfile.age}
          </Text>
          <Text style={[styles.profileLocation, { fontFamily: FONTS.regular }]}>
            📍 {currentProfile.location}
          </Text>
          <Text style={[styles.profileBio, { fontFamily: FONTS.regular }]}>
            {currentProfile.bio}
          </Text>
        </View>

        {/* Self video (small) */}
        <View style={styles.selfVideo}>
          <Ionicons name="person" size={24} color="#fff" />
        </View>
      </Animated.View>

      {/* Controls */}
      {!isActive ? (
        <TouchableOpacity style={styles.startBtn} onPress={startSession}>
          <Ionicons name="videocam" size={24} color="#fff" />
          <Text style={[styles.startBtnText, { fontFamily: FONTS.bold }]}>
            {timeLeft === SPEED_DATE_DURATION ? 'Start Speed Date' : 'Resume'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Ionicons name="close" size={32} color="#fff" />
            <Text style={[styles.actionLabel, { fontFamily: FONTS.regular }]}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
            <Ionicons name="heart" size={32} color="#fff" />
            <Text style={[styles.actionLabel, { fontFamily: FONTS.regular }]}>Like</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {DEMO_PROFILES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i < currentIndex ? '#4ade80' : i === currentIndex ? '#FF2D7A' : '#2a2a2a' }
            ]}
          />
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  timerSection: { alignItems: 'center', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  timerText: { fontSize: 48, fontWeight: '800' },
  progressBarOuter: { width: '100%', height: 6, backgroundColor: '#2a2a2a', borderRadius: 3, overflow: 'hidden' },
  progressBarInner: { height: 6, borderRadius: 3 },
  videoArea: { flex: 1, marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', backgroundColor: '#1a1a1a', position: 'relative' },
  videoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  avatarCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,45,122,0.15)', alignItems: 'center', justifyContent: 'center' },
  liveIndicator: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF2D7A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 12 },
  profileOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.7)', gap: 4 },
  profileName: { fontSize: 22, fontWeight: '700', color: '#fff' },
  profileLocation: { fontSize: 13, color: '#aaa' },
  profileBio: { fontSize: 13, color: '#ccc', marginTop: 2 },
  selfVideo: { position: 'absolute', top: 16, right: 16, width: 70, height: 90, borderRadius: 12, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF2D7A' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FF2D7A', margin: 20, paddingVertical: 16, borderRadius: 16, shadowColor: '#FF2D7A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 20 },
  skipBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center', gap: 4 },
  micBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  likeBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FF2D7A', alignItems: 'center', justifyContent: 'center', gap: 4, shadowColor: '#FF2D7A', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
  actionLabel: { color: '#fff', fontSize: 11 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
  doneSub: { fontSize: 16, color: '#888', textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  statCard: { width: 90, borderRadius: 16, padding: 16, alignItems: 'center', gap: 6 },
  statNum: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: '#888' },
  doneBtn: { backgroundColor: '#FF2D7A', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16, marginTop: 16 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});