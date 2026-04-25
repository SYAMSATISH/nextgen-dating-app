import { View, Text, ImageBackground } from "react-native";
import { EvilIcons, Octicons } from "@expo/vector-icons";
interface UserCardProp {
  data: any;
  size: "small" | "large";
  showLikeIcon: boolean;
}
const UserCard = ({
  data,
  size = "small",
  showLikeIcon = false,
}: UserCardProp) => {
  const isLarge = size === "large";

  return (
    <View
      style={{
        padding: 16,
        gap: isLarge ? 10 : 5,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        elevation: 2,
      }}
    >
      <ImageBackground
        source={{ uri: data?.image }}
        style={{
          width: isLarge ? 240 : 180,
          height: isLarge ? 300 : 200,
          borderRadius: 10,
          overflow: "hidden",
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800" }}>
          {data?.name[0].toUpperCase()}, {data.age}
        </Text>
        {showLikeIcon && <EvilIcons name="heart" size={24} color="black" />}
      </View>
    </View>
  );
};

export default UserCard;
