import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const token = await AsyncStorage.getItem("token");
      setLoggedIn(!!token);
    };

    check();
  }, []);

  if (loggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return loggedIn ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/auth/signin" />
  );
}
