// npx expo install expo-image-picker
import React, { useState } from "react";
import { View, Button, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const takePicture = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required to take pictures.");
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1, // Highest quality
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Store the image URI
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Take a Picture" onPress={takePicture} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});
