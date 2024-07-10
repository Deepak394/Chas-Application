import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";


type MessageType = {
  _id: string;
  messageType: string;
  message?: string;
  imageUrl?: string;
  recepientId: string;
  senderId: {
    _id: string;
    name: string;
  };
  timeStamp: string;
  __v: number;
};
//@ts-ignore
const UserChat = ({ item }) => {
    const navigation = useNavigation();
    const { userId, setUserId } = useContext(UserType);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://192.168.172.17:3000/messages/${userId}/${item._id}`
        );
        const data = await res.json();
        if (res.ok) {
       
          setMessages(data);
        } else {
          console.log("Error fetching messages:", data); // Log the error response data
        }
      } catch (error) {
        console.log("Error while fetching Message", error);
      }
    };

    const formatTime = (time: any) => {
      const options = { hour: "numeric", minute: "numeric" };
      //@ts-ignore
      return new Date(time).toLocaleString("en-US", options);
    };
  
    const getLastMessage = () => {
      // Filter messages where messageType is "text"
      const userMsg = messages.filter((message) => message.messageType === "text");
      const len = userMsg.length;
      return userMsg[len - 1];
    };

    useEffect(() => {
    
      fetchMessages();
    }, [messages]);


    // console.log("Messages", messages)
    const lastMessage = getLastMessage();
    // console.log(lastMessage)
   
    
  return (
    <Pressable
    //@ts-ignore
    onPress={()=> navigation.navigate("Messages", {
        recepientId : item._id
    })}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 0.7,
        borderColor: "#D0D0D0",
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        padding: 10,
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
      <View style={{flex:1}}>
        <Text style={{ fontSize: 15, fontWeight: "500" }}>{item?.name}</Text>
        {lastMessage &&  <Text style={{ color: "gray", fontWeight: "500", marginTop: 3 }}>
          {lastMessage?.message}
        </Text> }
       
      </View>
      <View style={{}}>
        <Text style={{fontSize:11, fontWeight:"400", color:"#585858"}}>{lastMessage && formatTime(lastMessage?.timeStamp)}</Text>
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({});
