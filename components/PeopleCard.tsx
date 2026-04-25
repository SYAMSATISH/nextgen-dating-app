import { fetchUsersFromFirebase, User } from "@/DB/userDB";
import { db } from "@/constants/appwrite";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import Swiper from "react-native-deck-swiper";

const { width, height } = Dimensions.get("window");

const CURRENT_USER_ID = "wRFxwqQ6e8radhHxqxX9"; // Ravi Kumar ID — Firebase lo unna ID

const PeopleCard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const fetchedUsers = await fetchUsersFromFirebase();
    // Current user filter out cheyyi
    const otherUsers = fetchedUsers.filter(u => u.id !== CURRENT_USER_ID);
    setUsers(otherUsers);
    setLoading(false);
  };

  // Swipe right — like cheyyi, Firebase lo save cheyyi
  const handleSwipeRight = async (cardIndex: number) => {
    const likedUser = users[cardIndex];
    if (!likedUser) return;
    try {
      await updateDoc(doc(db, "users", CURRENT_USER_ID), {
        liked: arrayUnion(likedUser.id),
      });
      console.log("Liked:", likedUser.name);
    } catch (error) {
      console.error("Like save error:", error);
    }
  };

  // Swipe left — dislike, nothing save
  const handleSwipeLeft = (cardIndex: number) => {
    const dislikedUser = users[cardIndex];
    console.log("Disliked:", dislikedUser?.name);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No more profiles!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        cards={users}
        renderCard={(card) => (
          <View style={styles.card}>
            <ImageBackground source={{ uri: (card as any).photo || card.image }} style={styles.image}>
              <View style={styles.infoSection}>
                <Text style={styles.text}>
                  {card.name}, {card.age}
                </Text>
                {card.bio && (
                  <Text style={styles.bioText}>{card.bio}</Text>
                )}
              </View>
            </ImageBackground>
          </View>
        )}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={handleSwipeLeft}
        infinite={false}
        backgroundColor="transparent"
        cardVerticalMargin={10}
        stackSize={3}
        overlayLabels={{
          left: {
            title: (
              <View style={[styles.overlayLabel, styles.leftLabel]}>
                <AntDesign name="close" size={100} color="red" />
              </View>
            ),
            style: {
              wrapper: { justifyContent: "center", alignItems: "center" },
            },
          },
          right: {
            title: (
              <View style={[styles.overlayLabel, styles.rightLabel]}>
                <Ionicons name="checkmark-circle-sharp" size={100} color="green" />
              </View>
            ),
            style: {
              wrapper: { justifyContent: "center", alignItems: "center" },
            },
          },
        }}
        disableTopSwipe={true}
        disableBottomSwipe={true}
      />
    </View>
  );
};

export default PeopleCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
    marginTop: 10,
  },
  card: {
    width: width * 0.9,
    height: height * 0.8,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  infoSection: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  bioText: {
    color: "#ddd",
    fontSize: 14,
    marginTop: 4,
  },
  overlayLabel: {
    position: "absolute",
    top: "50%",
  },
  leftLabel: {
    left: 30,
  },
  rightLabel: {
    right: 30,
  },
});