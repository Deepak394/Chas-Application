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
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import SCTextInput from "../components/SCTextInput";
import NetInfo from "@react-native-community/netinfo";
import { Utils } from "../utils/Utils";


const RegisterScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [image, setImage] = useState<string>("");
  
  const [validate, setValidate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const navigation = useNavigation();
  const validatePassword = (input: string) => {
    // Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one digit.
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;
    return passwordRegex.test(input);
  };

  // defination handleRegister
  const handleRegister = () => {
    setLoading(!loading);
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        if (password?.length == 0 || email?.length == 0 || name?.length == 0) {
          setValidate(true);
          alert("Please enter Details");
          setLoading(loading);
          return;
        }
        if (!Utils.isValidEmail(email)) {
          alert("Please enter valid email");
          setLoading(loading);
          return;
        }
        if (validatePassword(password)) {
          alert(
            "Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, and 1 digit."
          );
          setLoading(false);
          return;
        }
        if (password != confirmPassword) {
          alert("Please enter same password");
          return;
        }
        const user = {
          name: name,
          email: email,
          password: password,
          image: image,
        };

        axios
          .post("http://192.168.172.17:3000/register", user)
          .then((res) => {
            Alert.alert(
              "Registration successful",
              "You have been registered successfully"
            );
            setName("");
            setEmail("");
            setPassword("");
            setImage("");
            setLoading(loading);
            setConfirmPassword("")
          })
          .catch((err) => {
            Alert.alert(
              "Registration Error",
              "An error occurred while registering"
            );
            console.log("Registration failed", err);
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
            Register
          </Text>
          <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 15 }}>
            Register To Your Account
          </Text>
        </View>
        <View style={{ marginTop: 50 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Name
            </Text>

            <SCTextInput
              placeholder={"Enter Your  Full Name"}
              onChangeText={(text) => setName(text)}
              value={name}
              validate={validate}
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Email
            </Text>

            <SCTextInput
              placeholder="Enter Your Email"
              onChangeText={(text: any) => setEmail(text)}
              validate={validate}
              value={email}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Password
            </Text>

            <SCTextInput
              placeholder="Password"
              onChangeText={(text) => {
                setPassword(text);
              }}
              validate={validate}
              value={password}
              secureTextEntry
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Confirm Password
            </Text>

            <SCTextInput
              placeholder="Confirm Password"
              onChangeText={(text) => setConfirmPassword(text)}
              validate={validate}
              value={confirmPassword}
              secureTextEntry
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Image
            </Text>
   
            <SCTextInput
              placeholder="Email Image Url"
              onChangeText={(text) => setImage(text)}
              value={image}
            />
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#7AC93B" />
          ) : (
            <Pressable
              onPress={handleRegister}
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
                Register
              </Text>
            </Pressable>
          )}

          <Pressable
            // @ts-ignore
            onPress={() => navigation.goBack()}
            style={{ marginTop: 15 }}
          >
            <Text style={{ textAlign: "center", color: "grey", fontSize: 16 }}>
              Already have an account? Sign In
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({});
