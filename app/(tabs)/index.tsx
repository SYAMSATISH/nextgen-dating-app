import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import Header from "@/components/Header";
import { Octicons } from "@expo/vector-icons";

const LikedYou = () => {
  const button = () => <Octicons name="filter" size={24} color="black" />;
  return (
    <ScrollView style={{ paddingHorizontal: 8 }}>
      <Header headerTitle={"Liked You"} button={button} />
      <Text style={{ fontWeight: "300" }}>
        When people are into you, they'll appear here. Enjoy
      </Text>
      <View
        style={{
          alignSelf: "center",
          alignItems: "center",
          position: "relative",
          top: 100,
          gap: 8,
          paddingHorizontal: 10,
        }}
      >
        <Image
          source={{
            uri: "https://plus.unsplash.com/premium_vector-1732639583203-83ff3f727fe8?q=80&w=2842&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          }}
          style={{ width: 200, height: 200, borderRadius: 20 }}
        />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#1a1a1a",
            textAlign: "center",
          }}
        >
          Get Spotlight for more likes
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: "#1a1a1a",
            textAlign: "center",
            fontWeight: "300",
          }}
        >
          You'll be shown ahead of other people for 30 minutes.
        </Text>
        <Pressable
          style={{
            width: 200,
            backgroundColor: "#1a1a1a",
            padding: 10,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 20 }}>Get Spotlight</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default LikedYou;

const styles = StyleSheet.create({});
