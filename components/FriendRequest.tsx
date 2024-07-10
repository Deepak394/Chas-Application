import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import React, { useContext } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
//@ts-ignore
const FriendRequest = ({ item, friendRequests, setFriendRequests }) => {
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();

  const acceptRequest = async (friendRequestId:any) => {
    try {
      const res = await fetch("http://192.168.172.17:3000/accept-friend-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId:friendRequestId,
          recepientId:userId,
        }),
      })
      if(res.ok) {
        setFriendRequests(friendRequests.filter((req:any)=> req._id !== friendRequestId))
        //@ts-ignore
        navigation.navigate("Chats")
       
      }
    } catch (error) {
      console.log("Error accepting the friend request",error)
    }

  }
  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,

      }}
    >
      {item.image ? (
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            resizeMode: "cover",
            
          }}
          source={{ uri: item.image }}
        />
      ) : (
        <FontAwesome name="user-circle-o" size={50} color="black" />
      )}
      <Text
        style={{
          fontSize: 15,
          fontWeight: "bold",
          
          flex: 1,
          marginHorizontal:8,
          
        }}
      >
        {item?.name} send you a friend request!
      </Text>
      <Pressable
      onPress={()=>acceptRequest(item._id)}
        style={{ backgroundColor: "#0066b2", padding: 10, borderRadius: 6 }}
      >
        <Text style={{ textAlign: "center", color: "#fff" }}> Accept</Text>
      </Pressable>
    </Pressable>
  );
};

export default FriendRequest;

const styles = StyleSheet.create({});
