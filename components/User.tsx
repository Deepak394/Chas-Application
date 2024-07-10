import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { UserType } from "../UserContext";



//@ts-ignore
const User = ({ item }) => {
  //@ts-ignore
  const { userId } = useContext(UserType);
  const [requestSend, setRequestSend] = useState<boolean>(false);
  const [friendRequests, setFriendRequests] = useState<string[]>([]);
  const [userFriends, setUserFriends] = useState<string[]>([]);

  const fetchFriendRequests = async () => {
    try {
      const res = await fetch(
        `http://192.168.172.17:3000/friend-request/sent/${userId}`
      );
      const data = await res.json();
      if (res.ok) {
        setFriendRequests(data);
      } else {
        console.log("Error fetching friend requests:", res.status);
      }
    } catch (error) {
      console.log("Error fetching friend requests:", error);
    }
  };

  const fetchUserFriends = async () => {
    try {
      const res = await fetch(`http://192.168.9.80:3000/friends/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setUserFriends(data);
      } else {
        console.log("Error fetching user friends:", res.status);
      }
    } catch (error) {
      console.log("Error fetching user friends:", error);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [friendRequests]);

  useEffect(() => {
    fetchUserFriends();
  }, [userFriends]);

  const sendFriendRequest = async (currentUserId: any, selectedUserID: any) => {
    try {
      const res = await fetch("http://192.168.172.17:3000/friend-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUserId,
          selectedUserID,
        }),
      });

      if (res.ok) {
        setRequestSend(true);
      } else {
        console.log("Error sending friend request:", res.status);
      }
    } catch (error) {
      console.log("Error sending friend request:", error);
    }
  };
 
  return (
    <Pressable
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}
    >
      <View>
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
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "bold" }}>{item?.name}</Text>
        <Text style={{ marginTop: 4, color: "gray" }}>{item?.email}</Text>
      </View>
      
      {userFriends.includes(item._id) ? (
        
        <Pressable
        disabled
          onPress={() => sendFriendRequest(userId, item._id)}
          style={{
            backgroundColor: "#82CD47",
            padding: 10,
            borderRadius: 6,
            width: 105,
          }}
        >
          <Text style={{ textAlign: "center", color: "#fff", fontSize: 13 }}>
            Friend
          </Text>
        </Pressable>
      ) : requestSend ||
        friendRequests.some((friend:any) => friend._id === item._id) ? (
        <Pressable
        disabled
          onPress={() => sendFriendRequest(userId, item._id)}
          style={{
            backgroundColor: "grey",
            padding: 10,
            borderRadius: 6,
            width: 105,
          }}
        >
          <Text style={{ textAlign: "center", color: "#fff", fontSize: 13 }}>
            Request Sent
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => sendFriendRequest(userId, item._id)}
          style={{
            backgroundColor: "#567189",
            padding: 10,
            borderRadius: 6,
            width: 105,
          }}
        >
          <Text style={{ textAlign: "center", color: "#fff", fontSize: 13 }}>
            Add Friend
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
};

export default User;

const styles = StyleSheet.create({});
