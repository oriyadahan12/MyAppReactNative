import React, { useEffect, useState} from "react";
import { Text, TouchableOpacity, Image} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { app } from '../../util/firebaseConfig';
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Toast from 'react-native-toast-message';
import { AntDesign } from "@expo/vector-icons"; 

const GoogleSignInButton = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);

  WebBrowser.maybeCompleteAuthSession();
  
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "710882524172-khjkd7jj81k62a0jl18mb4jk0njfpfo1.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@tair2000/my_new_app",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;

      if (!id_token) {
        console.error("❌ No ID Token received!");
        return;
      }

      const googleCredential = app.auth.GoogleAuthProvider.credential(id_token);

      app.auth().signInWithCredential(googleCredential)
        .then(async (userCredential) => {
          const firebaseUser = userCredential.user;

          // בדיקה אם המשתמש קיים ב-Firestore
          const userDoc = await app.firestore()
            .collection("users")
            .doc(firebaseUser.uid)
            .get();

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
                uid: firebaseUser.uid,
                personalUsername: userData.personalUsername || "",
                firstName: userData.firstName || "",
                familyName: userData.familyName || "",
                birthDate: userData.birthDate || null,
                gender: userData.gender || "",
                email: userData.email || "",
                familyUsername: userData.familyUsername || "",
                joinedAt: userData.joinedAt || null,
            });

            Toast.show({
                type: 'success',
                text1: 'Logged in successfully',
                style: { backgroundColor: '#28a745' },
            });

            navigation.navigate('Family', {familyUsername: userData.familyUsername, personalUsername: userData.personalUsername });
          }
          else {
            Toast.show({
              type: 'error',
              text1: 'No account found with this email',
              text2: 'Redirecting to sign up...',
              style: { backgroundColor: '#dc3545' },
            });

            navigation.navigate('Register');
          }
        })
        .catch((error) => {
          console.error("🔥 Firebase Authentication Error:", error);
        });
    }
  }, [response]);

  return (
    // <TouchableOpacity onPress={() => request && promptAsync()} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#DB4437", padding: 10, borderRadius: 5 }}>
    //   <AntDesign name="google" size={24} color="white" />
    //   <Text style={{ color: "white", marginLeft: 10 }}>Sign in with Google</Text>
    // </TouchableOpacity>


        <TouchableOpacity style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:'rgb(209, 197, 208)', 
          borderWidth: 1.5,
          borderColor:"rgb(102, 23, 102)",
          borderRadius: 16,
          paddingVertical: 10,
          marginTop: 20,}} 
          onPress={() => request && promptAsync()}>
          <Image source={require("../../assets/google-icon.png")} style={{width: 24, height: 24, marginRight: 10,}} />
          <Text style={{
    fontSize: 18,
    fontWeight: "bold",
    color: "rgb(58, 8, 58)",
  }}>התחבר עם Google</Text>
        </TouchableOpacity> 
  );
};

export default GoogleSignInButton;