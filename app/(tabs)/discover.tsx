import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/ThemeContext";
import { FONTS } from "@/constants/fonts";
import * as Location from 'expo-location';
import { auth, db } from "@/constants/appwrite";
import { doc, updateDoc } from "firebase/firestore";

const COMMUNITIES = [
  { id: '1', icon: 'laptop-outline', name: 'Tech Lovers', members: 1240, color: '#4CAF50' },
  { id: '2', icon: 'musical-notes', name: 'Music Vibes', members: 890, color: '#9C27B0' },
  { id: '3', icon: 'airplane', name: 'Travel Bugs', members: 2100, color: '#2196F3' },
  { id: '4', icon: 'pizza', name: 'Foodies', members: 1560, color: '#FF5722' },
  { id: '5', icon: 'book', name: 'Book Club', members: 430, color: '#795548' },
  { id: '6', icon: 'game-controller', name: 'Gamers', members: 980, color: '#607D8B' },
  { id: '7', icon: 'barbell', name: 'Fitness', members: 720, color: '#F44336' },
  { id: '8', icon: 'color-palette', name: 'Artists', members: 560, color: '#FF9800' },
];

const MODES = [
  { id: 'dating', icon: 'heart', label: 'Dating', color: '#FF2D7A' },
  { id: 'friends', icon: 'people', label: 'Friends', color: '#4FC3F7' },
  { id: 'networking', icon: 'briefcase', label: 'Network', color: '#FFD700' },
];

const EVENTS = [
  { id: '1', title: 'Weekend Hiking Trip', community: 'Travel Bugs', members: 24, icon: 'trail-sign', color: '#2196F3' },
  { id: '2', title: 'Coffee & Code Meetup', community: 'Tech Lovers', members: 18, icon: 'cafe', color: '#4CAF50' },
  { id: '3', title: 'Open Mic Night', community: 'Music Vibes', members: 35, icon: 'mic', color: '#9C27B0' },
];

const TRAVEL_CITIES = [
  { id: '1', city: 'Mumbai', country: 'India', icon: 'business', color: '#FF6B00' },
  { id: '2', city: 'Delhi', country: 'India', icon: 'train', color: '#9C27B0' },
  { id: '3', city: 'Bangalore', country: 'India', icon: 'code-slash', color: '#4CAF50' },
  { id: '4', city: 'Dubai', country: 'UAE', icon: 'diamond', color: '#FFD700' },
  { id: '5', city: 'Singapore', country: 'Singapore', icon: 'globe', color: '#2196F3' },
  { id: '6', city: 'London', country: 'UK', icon: 'umbrella', color: '#607D8B' },
];

export default function Discover() {
  const { colors, isDark } = useTheme();
  const [selectedMode, setSelectedMode] = useState('dating');
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [rsvpEvents, setRsvpEvents] = useState<string[]>([]);
  const [travelMode, setTravelMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...');
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => { getCurrentLocation(); }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Location permission denied');
        setLocationLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (geocode.length > 0) {
        const place = geocode[0];
        setCurrentLocation(`${place.city || place.region}, ${place.country}`);
        const uid = auth.currentUser?.uid;
        if (uid) {
          await updateDoc(doc(db, 'users', uid), {
            location: {
              city: place.city,
              country: place.country,
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            }
          });
        }
      }
    } catch (error) {
      setCurrentLocation('Location unavailable');
    }
    setLocationLoading(false);
  };

  const handleTravelMode = async (cityId: string) => {
    const city = TRAVEL_CITIES.find(c => c.id === cityId);
    if (!city) return;
    setSelectedCity(cityId);
    const uid = auth.currentUser?.uid;
    if (uid) {
      await updateDoc(doc(db, 'users', uid), {
        travelMode: true,
        travelCity: city.city,
        travelCountry: city.country,
      });
    }
    Alert.alert('Travel Mode! ✈️', `You are now discovering people in ${city.city}, ${city.country}!`);
  };

  const toggleJoin = (id: string) => {
    const community = COMMUNITIES.find(c => c.id === id);
    if (joinedCommunities.includes(id)) {
      setJoinedCommunities(prev => prev.filter(c => c !== id));
      Alert.alert('Left Community', `You left ${community?.name}`);
    } else {
      setJoinedCommunities(prev => [...prev, id]);
      Alert.alert('Joined! 🎉', `Welcome to ${community?.name}!`);
    }
  };

  const handleRSVP = (eventId: string) => {
    const event = EVENTS.find(e => e.id === eventId);
    if (rsvpEvents.includes(eventId)) {
      setRsvpEvents(prev => prev.filter(e => e !== eventId));
      Alert.alert('Cancelled', `You cancelled RSVP for ${event?.title}`);
    } else {
      setRsvpEvents(prev => [...prev, eventId]);
      Alert.alert('RSVP Confirmed! 🎉', `See you at ${event?.title}!`);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background, flex: 1 }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={{ paddingHorizontal: 16, gap: 20 }}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSub, { color: colors.subtext, fontFamily: FONTS.medium }]}>EXPLORE</Text>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Discover</Text>
          </View>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Location Card */}
        <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.locationLeft}>
            <View style={[styles.locationIconWrap, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
              <Ionicons name="location" size={20} color="#FF2D7A" />
            </View>
            <View>
              <Text style={[styles.locationLabel, { color: colors.subtext, fontFamily: FONTS.regular }]}>Your Location</Text>
              <Text style={[styles.locationCity, { color: colors.text, fontFamily: FONTS.semibold }]}>
                {locationLoading ? 'Getting location...' : currentLocation}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.travelModeBtn, { backgroundColor: travelMode ? '#FF2D7A' : 'rgba(255,45,122,0.15)' }]}
            onPress={() => setTravelMode(!travelMode)}
          >
            <Ionicons name="airplane" size={16} color={travelMode ? '#fff' : '#FF2D7A'} />
            <Text style={[styles.travelModeBtnText, { color: travelMode ? '#fff' : '#FF2D7A', fontFamily: FONTS.semibold }]}>
              {travelMode ? 'Travel On' : 'Travel'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Travel Mode Cities */}
        {travelMode && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(255,107,0,0.15)' }]}>
                <Ionicons name="airplane" size={14} color="#FF6B00" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>
                Travel Mode — Pick a City
              </Text>
            </View>
            <View style={styles.citiesGrid}>
              {TRAVEL_CITIES.map((city) => {
                const isSelected = selectedCity === city.id;
                return (
                  <TouchableOpacity
                    key={city.id}
                    style={[styles.cityCard, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', borderColor: isSelected ? city.color : colors.border }]}
                    onPress={() => handleTravelMode(city.id)}
                  >
                    <View style={[styles.cityIconWrap, { backgroundColor: `${city.color}22` }]}>
                      <Ionicons name={city.icon as any} size={20} color={city.color} />
                    </View>
                    <Text style={[styles.cityName, { color: colors.text, fontFamily: FONTS.semibold }]}>{city.city}</Text>
                    <Text style={[styles.cityCountry, { color: colors.subtext, fontFamily: FONTS.regular }]}>{city.country}</Text>
                    {isSelected && (
                      <View style={[styles.cityCheck, { backgroundColor: city.color }]}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Mode Selector */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(255,45,122,0.15)' }]}>
              <Ionicons name="options" size={14} color="#FF2D7A" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>
              What are you here for?
            </Text>
          </View>
          <View style={styles.modeRow}>
            {MODES.map((mode) => {
              const isActive = selectedMode === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[styles.modeChip, { borderColor: isActive ? mode.color : colors.border, backgroundColor: isActive ? `${mode.color}22` : colors.background }]}
                  onPress={() => setSelectedMode(mode.id)}
                >
                  <View style={[styles.modeIconWrap, { backgroundColor: isActive ? `${mode.color}33` : 'rgba(255,255,255,0.05)' }]}>
                    <Ionicons name={mode.icon as any} color={isActive ? mode.color : colors.subtext} size={18} />
                  </View>
                  <Text style={[styles.modeLabel, { color: isActive ? mode.color : colors.subtext, fontFamily: FONTS.semibold }]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Communities */}
        <View style={{ gap: 12 }}>
          <View style={styles.sectionHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(79,195,247,0.15)' }]}>
              <Ionicons name="people" size={14} color="#4FC3F7" />
            </View>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Interest Communities</Text>
              <Text style={[styles.subTitle, { color: colors.subtext, fontFamily: FONTS.regular }]}>Meet people with same interests</Text>
            </View>
          </View>
          <View style={styles.communitiesGrid}>
            {COMMUNITIES.map((community) => {
              const isJoined = joinedCommunities.includes(community.id);
              return (
                <View key={community.id} style={[styles.communityCard, { backgroundColor: colors.card, borderColor: isJoined ? community.color : colors.border }]}>
                  <View style={[styles.communityIconWrap, { backgroundColor: `${community.color}22` }]}>
                    <Ionicons name={community.icon as any} color={community.color} size={28} />
                  </View>
                  <Text style={[styles.communityName, { color: colors.text, fontFamily: FONTS.bold }]}>{community.name}</Text>
                  <Text style={[styles.communityMembers, { color: colors.subtext, fontFamily: FONTS.regular }]}>
                    {isJoined ? community.members + 1 : community.members} members
                  </Text>
                  <TouchableOpacity
                    style={[styles.joinBtn, { backgroundColor: isJoined ? `${community.color}22` : community.color, borderWidth: isJoined ? 1 : 0, borderColor: community.color }]}
                    onPress={() => toggleJoin(community.id)}
                  >
                    {isJoined && <Ionicons name="checkmark" size={14} color={community.color} />}
                    <Text style={[styles.joinText, { color: isJoined ? community.color : 'white', fontFamily: FONTS.semibold }]}>
                      {isJoined ? 'Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Trending Events */}
        <View style={{ gap: 12 }}>
          <View style={styles.sectionHeader}>
            <View style={[styles.glossIconWrap, { backgroundColor: 'rgba(255,107,0,0.15)' }]}>
              <Ionicons name="flame" size={14} color="#FF6B00" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: FONTS.bold }]}>Trending Near You</Text>
          </View>
          {EVENTS.map((event) => {
            const isRsvp = rsvpEvents.includes(event.id);
            return (
              <TouchableOpacity key={event.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: isRsvp ? event.color : colors.border }]}>
                <View style={[styles.eventIconWrap, { backgroundColor: `${event.color}22` }]}>
                  <Ionicons name={event.icon as any} color={event.color} size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eventTitle, { color: colors.text, fontFamily: FONTS.semibold }]}>{event.title}</Text>
                  <Text style={[styles.eventCommunity, { color: colors.subtext, fontFamily: FONTS.regular }]}>
                    {event.community} • {isRsvp ? event.members + 1 : event.members} going
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.rsvpBtn, { backgroundColor: isRsvp ? `${event.color}22` : '#FF2D7A', borderWidth: isRsvp ? 1 : 0, borderColor: event.color }]}
                  onPress={() => handleRSVP(event.id)}
                >
                  {isRsvp && <Ionicons name="checkmark" size={12} color={event.color} />}
                  <Text style={[styles.rsvpText, { fontFamily: FONTS.bold, color: isRsvp ? event.color : '#fff' }]}>
                    {isRsvp ? 'Going ✓' : 'RSVP'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
  headerSub: { fontSize: 11, letterSpacing: 1.5 },
  headerTitle: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  headerBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  locationCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 18, borderWidth: 1 },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  locationLabel: { fontSize: 11, letterSpacing: 0.5 },
  locationCity: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  travelModeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  travelModeBtnText: { fontSize: 13, fontWeight: '600' },
  section: { borderRadius: 20, padding: 16, gap: 12, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  subTitle: { fontSize: 12, marginTop: 2 },
  glossIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  citiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cityCard: { width: '30%', borderRadius: 14, padding: 10, alignItems: 'center', gap: 4, borderWidth: 1.5 },
  cityIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  cityName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  cityCountry: { fontSize: 10, textAlign: 'center' },
  cityCheck: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5 },
  modeIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modeLabel: { fontSize: 12, fontWeight: '600' },
  communitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  communityCard: { width: '47%', borderRadius: 18, padding: 14, alignItems: 'center', gap: 8, borderWidth: 1 },
  communityIconWrap: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  communityName: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  communityMembers: { fontSize: 11, textAlign: 'center' },
  joinBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 20, paddingVertical: 7, borderRadius: 20 },
  joinText: { fontSize: 13, fontWeight: '600' },
  eventCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, gap: 12, borderWidth: 1 },
  eventIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 14, fontWeight: '600' },
  eventCommunity: { fontSize: 12, marginTop: 2 },
  rsvpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  rsvpText: { fontSize: 12, fontWeight: '700' },
});