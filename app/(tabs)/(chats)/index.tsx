import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import Header from "@/components/Header";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import { linkTo, navigate } from "expo-router/build/global-state/routing";
import { useRouter } from "expo-router";

const Chats = () => {
  const router = useRouter();
  const button = () => <AntDesign name="search1" size={24} color="black" />;
  return (
    <ScrollView style={{ paddingHorizontal: 8 }}>
      <View style={{ gap: 10 }}>
        <Header headerTitle={"Chats"} button={button} />
        <Pressable
          onPress={() => {
            router.push("/charscreenf");
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Your matches</Text>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Avatar
            size={80}
            image="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          />
          <View style={{ width: "100%" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "300",
                maxWidth: "70%",
              }}
            >
              Spotlight is the easiest way to up your adds of a match!
            </Text>
          </View>
        </View>
        <View style={styles.headerSection}>
          <Text style={styles.logo}>Chats</Text>
          <MaterialCommunityIcons name="sort-variant" size={24} color="black" />
        </View>
      </View>
    </ScrollView>
  );
};

export default Chats;

const styles = StyleSheet.create({
  headerSection: {
    justifyContent: "space-between",
    flexDirection: "row",
    paddingVertical: 8,
    marginBottom: 6,
  },
  logo: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#1a1a1a",
  },
});
