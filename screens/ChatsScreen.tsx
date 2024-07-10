import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import UserChat from "../components/UserChat";

const ChatsScreen = () => {
  //@ts-ignore
  const { userId, setUserId } = useContext(UserType);
  const [acceptedFriends, setAcceptedFriends] = useState<any>([]);
  const navigation = useNavigation();

  const acceptedFriendsList = async () => {
    try {
      const response = await fetch(
        `http://192.168.172.17:3000/accepted-friends/${userId}`
      );
      const data = await response.json();
      if (response.ok) {
        setAcceptedFriends(data.acceptedFriends || []);
      }
    } catch (error) {
      console.log("Error showing acceptedFriendList ", error);
    }
  };

  useEffect(() => {
    acceptedFriendsList();
  }, []);
  // console.log(acceptedFriends);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
      {acceptedFriends && acceptedFriends.map((item:any, index:any) => (
      <UserChat
        key={index}
        item={item}
      />
    ))}
      </Pressable>
    </ScrollView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({});
