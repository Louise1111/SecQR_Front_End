import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AuthContext } from "../components/authentication/AuthContext";

import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Notification from "../components/notification";
import * as FileSystem from "expo-file-system";
import { API_BASE_URL } from "../assets/api";
import Header from "../components/header";

export default function ScanScreen({ route }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [token, setToken] = useState(null);

  const { userToken } = useContext(AuthContext);

  useEffect(() => {
    loadImages();
    setToken(route.params?.token || userToken);
  }, [route.params, userToken]);

  const loadImages = async () => {
    await ensureDirExists();
    const files = await FileSystem.readDirectoryAsync(imgDir);
    if (files.length > 0) {
      setImage(files.map((f) => imgDir + f));
    }
  };

  useEffect(() => {
    if (route.params?.scannedResult) {
      setScannedResult(route.params.scannedResult);
      toggleModal();
    }
  }, [route.params]);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const goBack = () => {
    navigation.pop();
  };

  const goToCameraScreen = () => {
    navigation.navigate("CameraScreen", { token: userToken });
  };

  const goToHistoryScreen = () => {
    navigation.navigate("History", { token: userToken });
  };

  const imgDir = FileSystem.documentDirectory + "scan_images/";

  const ensureDirExists = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(imgDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
      }
    } catch (error) {
      console.error("Error ensuring directory exists:", error);
    }
  };
  const openImagePicker = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
      });

      if (result && !result.cancelled) {
        const uri = result.assets[0].uri; // Access URI based on option
        console.log(uri);
        saveImage(uri);
      } else if (result && result.cancelled) {
        return;
      } else {
        return;
      }
    } catch (error) {
      // Handle any other errors that may occur during image selection
      return;
    }
  };

  const saveImage = async (uri) => {
    try {
      await ensureDirExists(); // Ensure the directory exists

      const filename = new Date().getTime() + ".jpg";
      const destPath = imgDir + filename;

      // Copy the image asynchronously
      await FileSystem.copyAsync({ from: uri, to: destPath });

      // Update the state with the new image path
      setImage([...image, destPath]);

      // Upload the image
      scanImage(destPath);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };
  const scanImage = async (uri) => {
    setLoading(true);
    try {
      const response = await FileSystem.uploadAsync(
        `${API_BASE_URL}/api/scan/`,
        uri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "image",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);

      console.log("Response:", response);

      if (response.status === 201) {
        const responseData = JSON.parse(response.body);
        console.log("Response data:", responseData);

        navigation.navigate("Scan", {
          scannedResult: responseData,
        });

        console.log("Image scanned successfully!");
      } else {
        Alert.alert("Error", "No QR code or No link found");
      }
    } catch (error) {
      Alert.alert("Error", "Cannot upload.Please check internet or try again.");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sideHeader}>
        <TouchableOpacity onPress={goBack} style={styles.logoContainer}>
          <Image
            source={require("../assets/logo/backIcon.png")}
            style={styles.logo2}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Scan QR Code</Text>
      </View>

      <Header />
      <TouchableOpacity style={styles.button} onPress={goToCameraScreen}>
        <Image
          source={require("../assets/logo/camera.png")}
          style={styles.logo}
        />
        <Text style={styles.buttonText}>Capture QR</Text>
      </TouchableOpacity>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B8F87" />

          <Text style={styles.loadingText}>Scanning...</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={openImagePicker}>
        <Image
          source={require("../assets/logo/galleryIcon.png")}
          style={styles.logo}
        />
        <Text style={styles.buttonText}>Upload Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={goToHistoryScreen}>
        <Image
          source={require("../assets/logo/history.png")}
          style={styles.logo}
        />
        <Text style={styles.buttonText}>History</Text>
      </TouchableOpacity>

      <Notification
        visible={modalVisible}
        onClose={toggleModal}
        scannedResult={scannedResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  sideHeader: {
    position: "absolute",
    top: 0,
    flexDirection: "row",
    width: "100%",
    height: 58,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#0B8F87",
    zIndex: 1,
  },
  button: {
    flexDirection: "row",
    width: 299,
    height: 58,
    borderRadius: 10,
    marginBottom: 13,
    justifyContent: "left",
    alignItems: "center",
    backgroundColor: "#0B8F87",
  },
  logo: {
    width: 37,
    height: 37,
    marginRight: 15,
    marginLeft: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },
  logoContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
  },
  logo2: {
    width: 40,
    height: 40,
  },
  image1: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  headerText: {
    color: "white",
    fontSize: 27,
    fontWeight: "bold",
    marginLeft: 60,
  },
  loadingContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    padding: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
