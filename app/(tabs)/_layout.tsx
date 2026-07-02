import { Tabs, useSegments } from "expo-router";
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/ThemeContext";

function TabIcon({ name, focused, label }: any) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons name={name} size={20} color={focused ? '#fff' : '#666'} />
      </View>
      {focused && <Text style={styles.tabLabel}>{label}</Text>}
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const segments = useSegments();
  const isChatScreen = segments.some(s => s === 'charscreenf');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
      initialRouteName="profile"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: isChatScreen ? { display: 'none' } : {
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            height: 64,
            borderRadius: 32,
            borderTopWidth: 0,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
          },
          tabBarItemStyle: { height: 64, paddingVertical: 10 },
        }}
      >
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="person" focused={focused} label="Profile" />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="compass-outline" focused={focused} label="Discover" />
            ),
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="people" focused={focused} label="People" />
            ),
          }}
        />
        <Tabs.Screen
          name="(chats)"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="chatbubble-ellipses" focused={focused} label="Chats" />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="sparkles" focused={focused} label="Home" />
            ),
          }}
        />
        {/* VerificationScreen — tab bar లో hide, route గా మాత్రమే */}
        <Tabs.Screen
          name="VerifySelfie"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: {
    backgroundColor: '#FF2D7A',
    shadowColor: '#FF2D7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  tabLabel: { fontSize: 9, fontWeight: '600', color: '#FF2D7A', letterSpacing: 0.5 },
});
