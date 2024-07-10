import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { decode } from "base-64";
import User from "../components/User";
// import "core-js/stable/atob";
global.atob = decode;

const HomeScreen = () => {
  const navigation = useNavigation();
  //@ts-ignore
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Swift Chat</Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
          //@ts-ignore
            onPress={() => navigation.navigate("Chats")}
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
          />

          <MaterialIcons
            //@ts-ignore
            onPress={() => navigation.navigate("Friends")}
            name="people-outline"
            size={24}
            color="black"
          />
          
        </View>
      ),
    });
  }, []);


  interface JwtPayload {
    userId: string;
    // Add any other properties from your JWT payload if necessary
  }
  
  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      // console.log('Retrieved token:', token);  
  
      if (!token) {
        throw new Error('Token not found');
      }
  
      const decodedToken = jwtDecode<JwtPayload>(token);
  
      const userId = decodedToken.userId;
      if (!userId) {
        throw new Error('Invalid token payload');
      }
  
      setUserId(userId);
  
      const response = await axios.get(`http://192.168.172.17:3000/users/${userId}`);
      setUsers(response.data);
    } catch (error) {
      console.log('Error retrieving users', error);
      // Handle error appropriately
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  // console.log("Users ", userId);
  return (
    <View>
      <View style={{ padding: 10 }}>
        {users.map((item, index: any) => (
          <User key={index} item={item} />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
