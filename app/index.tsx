import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { auth } from "@/constants/appwrite";
import { onAuthStateChanged } from "firebase/auth";

export default function Index() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (loggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a" }}>
        <ActivityIndicator color="#FF2D7A" size="large" />
      </View>
    );
  }

  return loggedIn ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/auth/signin" />
  );
}
