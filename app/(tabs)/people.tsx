import {
  Button,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import PeopleCard from "@/components/PeopleCard";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Octicons } from "@expo/vector-icons";
import Header from "@/components/Header";

const people = () => {
  const button = () => <Octicons name="filter" size={24} color="black" />;
  return (
    <View style={styles.container}>
      <Header headerTitle={"NextGen Dating"} button={button} />
      <PeopleCard />
    </View>
  );
};

export default people;

const styles = StyleSheet.create({
  headerSection: {
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  logo: {
    fontSize: 20,
  },
  container: {
    height: Dimensions.get("screen").height,
    width: Dimensions.get("screen").width,
    paddingHorizontal: 8,
  },
});
