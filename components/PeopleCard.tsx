import { fetchUsersFromFirebase, getCompatibilityScore, User } from "@/DB/userDB";
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

const CURRENT_USER_ID = "Ao5bEhPi8nfSUhu1rH79goZ4Bjs1";
const CURRENT_USER = { name: "Ravi Kumar", intent: "relationship", bio: "Software developer from Hyderabad", age: 26 };

const PeopleCard = ({ selectedMood }: { selectedMood?: string }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<{[key: string]: {score: number, reason: string}}>({});

  useEffect(() => {
    loadUsers();
  }, [selectedMood]);

  const loadUsers = async () => {
    setLoading(true);
    const fetchedUsers = await fetchUsersFromFirebase();
    let otherUsers = fetchedUsers.filter(u => u.id !== CURRENT_USER_ID);

    // Mood filter
    if (selectedMood) {
      const moodFiltered = otherUsers.filter(u => (u as any).currentMood === selectedMood);
      if (moodFiltered.length > 0) otherUsers = moodFiltered;
    }

    setUsers(otherUsers);
    setLoading(false);

    const scoreMap: any = {};
    for (const user of otherUsers) {
      const result = getCompatibilityScore(CURRENT_USER, user);
      scoreMap[user.id] = result;
    }
    setScores(scoreMap);
  };

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
            <ImageBackground
              source={{ uri: (card as any).photo || card.image }}
              style={styles.image}
            >
              <View style={styles.infoSection}>
                <Text style={styles.nameText}>
                  {card.name}, {card.age}
                </Text>
                {card.bio && (
                  <Text style={styles.bioText}>{card.bio}</Text>
                )}
                {(card as any).currentMood && (
                  <Text style={styles.moodText}>
                    Mood: {(card as any).currentMood}
                  </Text>
                )}
                {scores[card.id] && (
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>
                      ❤️ {scores[card.id].score}% Match
                    </Text>
                    <Text style={styles.scoreReason}>
                      {scores[card.id].reason}
                    </Text>
                  </View>
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
    height: height * 0.7,
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
  nameText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  bioText: {
    color: "#ddd",
    fontSize: 14,
    marginTop: 4,
  },
  moodText: {
    color: "#FFD700",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
  scoreContainer: {
    backgroundColor: "rgba(233, 30, 99, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignItems: "center",
  },
  scoreText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  scoreReason: {
    color: "white",
    fontSize: 12,
    marginTop: 2,
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