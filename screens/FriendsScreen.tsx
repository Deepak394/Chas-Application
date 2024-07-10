import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { UserType } from "../UserContext";
import axios from "axios";
import FriendRequest from "../components/FriendRequest";

const FriendsScreen = () => {
  const [friendRequest, setFriendRequest] = useState([]);

  const { userId,setUserId } = useContext(UserType);
  const fetchTheFriendRequests = async () => {
    try {
      const res = await axios.get(
        `http://192.168.172.17:3000/friend-request/${userId}`
      );
      if (res.status === 200) {
        
        const friendRequestData = res.data.map((friendRequest: any) => ({
          _id: friendRequest._id,
          name: friendRequest.name,
          email: friendRequest.email,
          image: friendRequest.image,
        }));
        setFriendRequest(friendRequestData);
      }
    } catch (err) {
      console.log("Error fetchingFriendReqests", err);
    }
  };

  useEffect(() => {
    fetchTheFriendRequests();
  }, []);
  console.log(friendRequest)

  return (
    <View style={{ padding: 10, marginHorizontal: 12 }}>
      {friendRequest.length > 0 && <Text>Your Friend Request!</Text>}
      {friendRequest.map((item:any, index:any) => (
       
        <FriendRequest
          key={index}
           //@ts-ignore
          item={item}
          friendRequests={friendRequest}
          setFriendRequests={setFriendRequest}
        />
      ))}
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({});
