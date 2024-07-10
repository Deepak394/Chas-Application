import React from "react";
import { TextInput, Text, View } from "react-native";

type SCTextInputProps = {
  placeholder: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  validate?: boolean;
  value: string;
};

const SCTextInput = (props: SCTextInputProps) => {
  const handleOnChangeText = (text: string) => {
    props.onChangeText(text);
  };

  return (
    <View>
      <TextInput
        value={props.value}
        onChangeText={handleOnChangeText}
        style={{
          borderBottomColor: "grey",
          borderBottomWidth: 1,
          marginVertical: 10,
          width: 300,
          fontSize: 18,
        }}
        placeholderTextColor={"black"}
        placeholder={props.placeholder}
        secureTextEntry={props.secureTextEntry}
      />
      {props.validate && props.value.length === 0 && (
        <Text style={{ fontSize: 12, color: "red" }}>
          {`Please enter ${props.placeholder}`}
        </Text>
      )}
    </View>
  );
};

export default SCTextInput;
