import { StyleSheet, Text, View } from "react-native";
import React from "react";

const chatscreen = () => {
  return (
    <View>
      <Text>chatscreen asfasdf</Text>
    </View>
  );
};

export default chatscreen;

const styles = StyleSheet.create({});
<TouchableOpacity 
  style={[styles.callBtn, { backgroundColor: 'rgba(255,45,122,0.15)' }]}
  onPress={() => Alert.alert(
    '📹 Video Call',
    'Starting video call with ' + DEMO_OTHER_USER.name + '...',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start Call', onPress: () => Alert.alert('Coming Soon!', 'Video calling feature will be available in next update! 🚀') }
    ]
  )}
>
  <Ionicons name="videocam-outline" size={22} color="#FF2D7A" />
</TouchableOpacity>