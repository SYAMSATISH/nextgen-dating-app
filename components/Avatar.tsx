import { Image, View } from "react-native";

const Avatar = ({ size, image }: { size: any; image?: string }) => {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", borderWidth: 3 }}>
      <Image
        style={{ width: "100%", height: "100%" }}
        source={{ uri: image || "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400" }}
      />
    </View>
  );
};

export default Avatar;