import React, { useState } from 'react';
import { View, Text, TextInput,Image, Alert, StyleSheet, TouchableOpacity, ImageBackground} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {collection, getDocs, query, where,} from 'firebase/firestore';
import { db } from '../../util/firebaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome5';
import GoogleSignInButton from "./GoogleSignInButton";


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'users'), where('personalUsername', '==', username))
      );

      if (querySnapshot.empty) {
        Alert.alert('שם משתמש לא קיים');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const realPassword = userDoc.data().password;
      const familyUsername = userDoc.data().familyUsername;

      if (realPassword !== password) {
        Alert.alert('סיסמה שגויה, נסה שנית');
        return;
      } else {
        const userData = { username, familyUsername };
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        Alert.alert('הצלחה', 'התחברות בוצעה בהצלחה! אתה מועבר לחשבונך..');
        
        // navigation.navigate('Family', {familyUsername, personalUsername: username });
        navigation.navigate('Family', {familyUsername, personalUsername: username });
        console.log(familyUsername)
        console.log(username)

      }
    } catch (error) {
      console.error('שגיאה בעת כניסה:', error);
      Alert.alert('שגיאה בלתי צפויה. נסה שוב מאוחר יותר.');
    }
  };



  return (
    <ImageBackground source={require("../../assets/background2.jpg")} style={styles.background}>
      
      <View style={styles.container}>
        <Text style={styles.title}>כניסה</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="שם משתמש"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="סיסמה"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Icon name={showPassword ? "eye" : "eye-slash"} size={20} color="rgb(102, 23, 102)" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>התחברות</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.buttonText}>רישום</Text>
          </TouchableOpacity>
        </View>
        <GoogleSignInButton />

      </View>

      <Image source={require("../../assets/1.png")} style={styles.familyIcon} />
          
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    resizeMode: "cover", 
    width: "100%", 
    height: "100%", 
},
  container: { 
    padding: 20, 
    backgroundColor: "rgba(253, 251, 253, 0.5)", 
    flex: 1, 
    borderRadius: 20, 
    margin: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30, 
    fontWeight: "bold", 
    marginBottom: 16, 
    textAlign: "center", 
    color: "#6A0572" 
  },
  input: {
    fontSize: 16,
    textAlign: "right",
    flex: 1, 
    marginLeft: 8 
  },
  inputContainer: {
    borderColor:"rgb(102, 23, 102)",
    flexDirection: "row", 
    alignItems: "center", 
    borderWidth: 1, 
    borderRadius: 16, 
    padding: 5, 
    backgroundColor: "#fff", 
    marginBottom: 10
  },
  eyeIcon: {
    color:"rgb(102, 23, 102)",
    position: "absolute",
    left: 10,
    top: "65%",
    transform: [{ translateY: -12 }], // ממרכז את האייקון אנכית
  },
  buttonContainer: {
    flexDirection: "row", 
    alignItems: "center",  
    padding: 10, 
    borderRadius: 16, 
    justifyContent: "space-between", 
    marginBottom: 8 
  },
  button:{
    width:"45%",
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#6A0572", 
    padding: 10, 
    borderRadius: 16, 
    justifyContent: "center", 
    marginBottom: 8 
  },
  buttonText:{
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 18, 
    marginLeft: 8,
  },
  familyIcon: { 
    width: 110, 
    height: 120, 
    position: "absolute", // מאפשר למקם אותו בלי להשפיע על שאר האלמנטים
    bottom: 10, 
    right: 20, // מזיז אותו לצד שמאל
  }
});

export default Login;