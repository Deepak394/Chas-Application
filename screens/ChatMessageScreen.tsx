import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
  Modal,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Entypo, Feather, Ionicons, FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const ChatMessageScreen = () => {
  const navigation = useNavigation();
  const [showEmojiSelector, setShowEmojiSelector] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [recepientData, setRecepientData] = useState<any>();
  const [modalVisible, setModalVisible] = useState(false);
  
  const { userId, setUserId } = useContext(UserType);
  const route = useRoute();
  //@ts-ignore
  const { recepientId } = route.params;

  const scrollViewRef = useRef<ScrollView | null>(null);

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    console.log("press")
    setModalVisible(false);
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: false});
    }
  };

  const handleContentSizeChange = () => {
    scrollToBottom();
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `http://192.168.172.17:3000/messages/${userId}/${recepientId}`
      );
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      } else {
        console.log("Error fetching messages:", data);
      }
    } catch (error) {
      console.log("Error while fetching Message", error);
    }
  };

  const fetchRecepientData = async () => {
    try {
      const res = await fetch(`http://192.168.172.17:3000/user/${recepientId}`);
      const data = await res.json();
      setRecepientData(data);
    } catch (error) {
      console.log("Error while fetching Recipient data", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [messages]);

  useEffect(() => {
    fetchRecepientData();
  }, []);

  const formatTime = (time: any) => {
    const options = { hour: "numeric", minute: "numeric" };
    //@ts-ignore
    return new Date(time).toLocaleString("en-US", options);
  };

  const handleSend = async (messageType: any, imageUrl: any) => {
    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recepientId", recepientId);

      if (messageType === "image") {
        formData.append("messageType", "image");
        //@ts-ignore
        formData.append("imageFile", {
          uri: imageUrl,
          name: "image.jpg",
          type: "image/jpeg",
        } as any);
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }

      const response = await fetch("http://192.168.172.17:3000/messages", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setMessage("");
        setSelectedImage("");
      }
    } catch (error) {
      console.log("Error while sending the message", error);
    }
  };

  const deletedMessage = async (messageIds: any) => {
    try {
      const res = await fetch("http://192.168.172.17:3000/deleteMessages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messageIds }),
      });
      if (res.ok) {
        setSelectedMessages((previousMessages) =>
          previousMessages.filter((id) => !messageIds.includes(id))
        );
        fetchMessages();
      } else {
        console.log("error deleting messages", res.status);
      }
    } catch (error) {
      console.log("error deleting message", error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />
          {selectedMessages.length > 0 ? (
            <View>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {selectedMessages.length}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {recepientData && recepientData.image ? (
                <Image
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 15,
                    resizeMode: "cover",
                  }}
                  source={{ uri: recepientData?.image }}
                />
              ) : (
                <FontAwesome name="user-circle-o" size={40} color="black" />
              )}
              <Text style={{ marginLeft: 5, fontSize: 15, fontWeight: "bold" }}>
                {recepientData?.name}
              </Text>
            </View>
          )}
        </View>
      ),
      headerRight: () => {
        return selectedMessages.length > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="arrow-redo-sharp" size={24} color="black" />
            <Ionicons name="arrow-undo-sharp" size={24} color="black" />
            <Ionicons name="star" size={24} color="black" />
            <MaterialIcons
              onPress={() => deletedMessage(selectedMessages)}
              name="delete"
              size={24}
              color="black"
            />
          </View>
        ) : null;
      },
    });
  }, [navigation, recepientData, selectedMessages]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      handleSend("image", uri);
    }
  };

  interface Message {
    _id: string;
  }

  const handleSelectMessage = (message: Message) => {
    const isSelected = selectedMessages.includes(message._id);

    if (isSelected) {
      setSelectedMessages((previousMessages) =>
        previousMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((previousMessages) => [
        ...previousMessages,
        message._id,
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} onContentSizeChange={handleContentSizeChange}>
        {messages &&
          messages.map((item: any, index: any) => {
            if (item.messageType === "text") {
              const isSelected = selectedMessages.includes(item._id);
              return (
                <Pressable
                  onLongPress={() => handleSelectMessage(item)}
                  key={index}
                  style={[
                    item?.senderId._id === userId
                      ? {
                          alignSelf: "flex-end",
                          backgroundColor: "#DCF8C6",
                          padding: 8,
                          maxWidth: "60%",
                          borderRadius: 7,
                          margin: 10,
                        }
                      : {
                          alignSelf: "flex-start",
                          backgroundColor: "#fff",
                          padding: 8,
                          margin: 10,
                          borderRadius: 7,
                          maxWidth: "60%",
                        },
                    isSelected && { width: "100%", backgroundColor: "#F0FFFF" },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      textAlign: isSelected ? "right" : "left",
                    }}
                  >
                    {item.message}
                  </Text>
                  <Text
                    style={{
                      textAlign: "right",
                      fontSize: 9,
                      color: "gray",
                      marginTop: 5,
                    }}
                  >
                    {formatTime(item.timeStamp)}
                  </Text>
                </Pressable>
              );
            }
            if (item.messageType === "image") {
              const baseUrl = "http://192.168.172.17:3000/files/";
              const imageUrl = item.imageUrl;
              const fileName = imageUrl.split("/").pop();
              const source = { uri: baseUrl + fileName };

              return (
                <Pressable
                  onPress={() => handleImagePress(source.uri)}
                  key={index}
                  style={[
                    item?.senderId._id === userId
                      ? {
                          alignSelf: "flex-end",
                          backgroundColor: "#DCF8C6",
                          padding: 8,
                          maxWidth: "60%",
                          borderRadius: 7,
                          margin: 10,
                        }
                      : {
                          alignSelf: "flex-start",
                          backgroundColor: "#fff",
                          padding: 8,
                          margin: 10,
                          borderRadius: 7,
                          maxWidth: "60%",
                        },
                  ]}
                >
                  <View>
                    <Image
                      source={source}
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: 7,
                        backgroundColor: "red",
                      }}
                    />
                    <Text
                      style={{
                        textAlign: "right",
                        fontSize: 9,
                        color: "white",
                        position: "absolute",
                        bottom: 7,
                        right: 10,
                        marginTop: 5,
                      }}
                    >
                      {formatTime(item?.timeStamp)}
                    </Text>
                  </View>
                </Pressable>
              );
            }
          })}
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: "#dddddd",
          marginBottom: showEmojiSelector ? 0 : 25,
        }}
      >
        <Entypo
          onPress={handleEmojiPress}
          style={{ marginRight: 5 }}
          name="emoji-happy"
          size={24}
          color="gray"
        />
        <TextInput
          value={message}
          onChangeText={(text: string) => setMessage(text)}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "#dddddd",
            borderRadius: 20,
            paddingHorizontal: 10,
          }}
          placeholder="Type Your Message...."
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginHorizontal: 8,
          }}
        >
          <Entypo onPress={pickImage} name="camera" size={24} color="gray" />
          <Feather name="mic" size={24} color="gray" />
        </View>

        <Pressable
          disabled={message.trim().length === 0}
          //@ts-ignore
          onPress={() => handleSend("text")}
          style={{
            backgroundColor: "#007bff",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            // marginLeft: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </Pressable>
      </View>
      {showEmojiSelector && (
        <EmojiSelector
          //@ts-ignore
          style={{ height: 250 }}
          onEmojiSelected={(emoji) => {
            setMessage((prevMessage) => prevMessage + emoji);
          }}
        />
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Pressable style={styles.closeButton} onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatMessageScreen;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    zIndex: 999
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
});
