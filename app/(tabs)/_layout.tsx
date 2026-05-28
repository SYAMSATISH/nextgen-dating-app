import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";

function TabIcon({ name, library, focused, label }: any) {
  const Icon = library === 'ion' ? Ionicons :
               library === 'mc' ? MaterialCommunityIcons : FontAwesome;
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Icon name={name} size={20} color={focused ? '#fff' : '#666'} />
      </View>
      {focused && <Text style={styles.tabLabel}>{label}</Text>}
    </View>
  );
}

export default function TabLayout() {
<<<<<<< HEAD
=======
  const { colors } = useTheme();
  const segments = useSegments();
  const isChatScreen = segments.some(s => s === 'charscreenf' || s === 'chatScreen');

>>>>>>> 7a5fb3f31 (feat: date diary, vibe chart, log a date feature)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <Tabs
        initialRouteName="people"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: {
            height: 90,
            paddingVertical: 14,
          },
        }}
      >
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="user" library="fa" focused={focused} label="Profile" />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="compass-outline" library="mc" focused={focused} label="Discover" />
            ),
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="people" library="ion" focused={focused} label="People" />
            ),
          }}
        />
        <Tabs.Screen
          name="(chats)"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="chatbubble-ellipses" library="ion" focused={focused} label="Chats" />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="heart" library="ion" focused={focused} label="Liked You" />
            ),
          }}
        />
        <Tabs.Screen
          name="VerificationScreen"
          options={{ href: null }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 90,
    borderRadius: 45,
    borderTopWidth: 0,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#FF2D7A',
    shadowColor: '#FF2D7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FF2D7A',
    letterSpacing: 0.5,
  },
});