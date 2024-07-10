import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Utils } from "../utils/Utils";
import NetInfo from "@react-native-community/netinfo";
import SCTextInput from "../components/SCTextInput";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const [validate, setValidate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // // checkLogin status
  // const checkLoginStatus = async () => {

  //   try {

  //       const token = await AsyncStorage.getItem("authToken");
  //       if (token) {
  //         //@ts-ignore
  //         navigation.replace("Home");
  //       } else {
  //        // token not found, show the login screen itself
  //       }

  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

  // useEffect(() => {

  //   checkLoginStatus();
  // }, []);

  const handleLogin = () => {
    setLoading(!loading);
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        if (password?.length == 0 || email?.length == 0 ) {
          setValidate(true);
          alert("Please enter valid Details");
          setLoading(loading);
          return;
        }
        if (!Utils.isValidEmail(email)) {
          alert("Please enter valid email");
          setLoading(loading);
          return;
        }

        const user = {
          email: email,
          password: password,
        };
        axios
          .post("http://192.168.172.17:3000/login", user)
          .then((res) => {
            // console.log(res);
            const token = res.data.token;

            AsyncStorage.setItem("authToken", token);
            setEmail("");
            setPassword("");
            setLoading(!loading)
            //@ts-ignore
            navigation.replace("Home");
          })
          .catch((err) => {
            console.log("login Error", err);
            Alert.alert("Login Error", "Invalid email or password");
          });
      } else {
        // No internet connection, display an error message
        alert("No internet connection. Please check your network settings.");
      }
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        padding: 10,
        alignItems: "center",
      }}
    >
      <KeyboardAvoidingView>
        <View
          style={{
            marginTop: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#4A55A2", fontSize: 17, fontWeight: "600" }}>
            Sign In
          </Text>
          <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 15 }}>
            Sign In To Your Account
          </Text>
        </View>
        <View style={{ marginTop: 50 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Email
            </Text>
        
            <SCTextInput
              placeholder={"Enter Your Email"}
              onChangeText={(text) => setEmail(text)}
              value={email}
              validate={validate}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Password
            </Text>
     
                 <SCTextInput
              placeholder={"Enter Password"}
              onChangeText={(text) => setPassword(text)}
              value={password}
              validate={validate}
              secureTextEntry
            />
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#7AC93B" />
          ) : ( <Pressable
            onPress={handleLogin}
            style={{
              width: 200,
              backgroundColor: "#4A55A2",
              padding: 15,
              marginTop: 50,
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Login
            </Text>
          </Pressable>)}
         
          <Pressable
            // @ts-ignore
            onPress={() => navigation.navigate("Register")}
            style={{ marginTop: 15 }}
          >
            <Text style={{ textAlign: "center", color: "grey", fontSize: 16 }}>
              Don't have an account? Sign Up
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
