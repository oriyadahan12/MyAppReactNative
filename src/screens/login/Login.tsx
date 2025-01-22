import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { GoogleSignin } from '@react-native-google-signin/google-signin';



import {signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, AuthProvider,  signInWithCredential}
   from 'firebase/auth';

import {doc, getDoc, setDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  QuerySnapshot
} from 'firebase/firestore';
import { auth, db } from '../../util/firebaseConfig';

const Login = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
        navigation.navigate('Family', { familyUsername, personalUsername: username });
      }
    } catch (error) {
      console.error('שגיאה בעת כניסה:', error);
      Alert.alert('שגיאה בלתי צפויה. נסה שוב מאוחר יותר.');
    }
  };


  // const handleSocialLogin = async (provider: AuthProvider) => {
  //   try {
  //     let user: any; // Define user variable at the top level
  
  //     // אם הספק הוא Google
  //     if (provider instanceof GoogleAuthProvider) {
  //       // קבלת פרטי המשתמש
  //       const userInfo = await GoogleSignin.signIn();
  //       // קבלת הטוקנים בנפרד
  //       const tokens = await GoogleSignin.getTokens();
        
  //       const googleCredential = GoogleAuthProvider.credential(
  //         tokens.idToken,
  //         tokens.accessToken
  //       );
        
  //       const result = await signInWithCredential(auth, googleCredential);
  //       user = result.user;
  //     }
      
  //     // אם הספק הוא Facebook
  //     else if (provider instanceof FacebookAuthProvider) {
  //       const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
  //       if (result.isCancelled) {
  //         throw new Error('ההתחברות בוטלה');
  //       }
        
  //       const data = await AccessToken.getCurrentAccessToken();
  //       if (!data) {
  //         throw new Error('לא התקבל token');
  //       }
        
  //       const facebookCredential = FacebookAuthProvider.credential(data.accessToken);
  //       const userCredential = await signInWithCredential(auth, facebookCredential);
  //       user = userCredential.user;
  //     }
  
  //     // וידוא שיש לנו משתמש
  //     if (!user) {
  //       throw new Error('לא התקבלו פרטי משתמש');
  //     }
  
  //     // בדיקה אם המשתמש קיים במערכת
  //     const usersSnapshot = await getDocs(collection(db, 'users'));
  //     const existingUserDoc = usersSnapshot.docs.find(
  //       (doc) => doc.data().email === user.email
  //     );
  
  //     if (existingUserDoc) {
  //       const existingUser = existingUserDoc.data();
  //       const familyUsername = existingUser.familyUsername;
  //       const personalUsername = existingUserDoc.id;
  
  //       Alert.alert('המייל הזה כבר רשום במערכת, נכנסים לחשבונך...');
  //       navigation.navigate('Family', { familyUsername, personalUsername });
  //       return;
  //     }
  
  //     const action = prompt('בחר אופציה:\n1 - להצטרף למשפחה קיימת\n2 - ליצור משפחה חדשה');
  
  //     if (action === '1') {
  //       const familyUsername = prompt('הכנס שם משתמש של המשפחה:');
  //       const password = prompt('הכנס סיסמה של המשפחה:');
  
  //       if (!familyUsername || !password) {
  //         Alert.alert('יש להזין שם משתמש וסיסמה תקינים.');
  //         return;
  //       }
  
  //       const familyDoc = await getDoc(doc(db, 'families', familyUsername));
  //       if (!familyDoc.exists()) {
  //         Alert.alert('משפחה לא נמצאה.');
  //         return;
  //       }
  
  //       const familyData = familyDoc.data();
  //       if (familyData.password !== password) {
  //         Alert.alert('סיסמה שגויה.');
  //         return;
  //       }
  
  //       await updateDoc(doc(db, 'families', familyUsername), {
  //         [`members.${user.uid}`]: user.displayName?.split(' ')[0] || '',
  //       });
  
  //       await setDoc(doc(db, 'users', user.uid), {
  //         firstName: user.displayName?.split(' ')[0] || '',
  //         lastName: user.displayName?.split(' ')[1] || '',
  //         email: user.email,
  //         fromEmail: true,
  //         familyUsername,
  //         familyName: familyData.familyName,
  //         gender: '',
  //         birthDate: null,
  //         personalUsername: user.uid,
  //         joinDate: new Date().toISOString(),
  //       });
  
  //       Alert.alert('הצטרפת בהצלחה למשפחה הקיימת!');
  //       navigation.navigate('Family', { familyUsername, personalUsername: user.uid });
  //     } else if (action === '2') {
  //       // Similar steps for creating a new family
  //     } else {
  //       Alert.alert('בחירה לא תקינה');
  //     }
  //   } catch (error) {
  //     console.error('שגיאה בכניסה: ', error);
  //   }
  // };
  
  const handleSocialLogin = async () => {
    try {
      const provider = new GoogleAuthProvider(); // יצירת ספק התחברות
      const result = await signInWithPopup(auth, provider); // התחברות עם Popup
      const user = result.user; // שליפת פרטי המשתמש
  
      // בדיקת האם המשתמש כבר קיים במערכת
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const existingUserDoc = usersSnapshot.docs.find(
        (doc) => doc.data().email === user.email
      );
  
      if (existingUserDoc) {
        const existingUser = existingUserDoc.data();
        const familyUsername = existingUser.familyUsername;
        const personalUsername = existingUserDoc.id;
  
        Alert.alert('המייל הזה כבר רשום במערכת, נכנסים לחשבונך...');
        navigation.navigate('Family', { familyUsername, personalUsername });
        return;
      }
  
      const action = prompt('בחר אופציה:\n1 - להצטרף למשפחה קיימת\n2 - ליצור משפחה חדשה');
  
      if (action === '1') {
        const familyUsername = prompt('הכנס שם משתמש של המשפחה:');
        const password = prompt('הכנס סיסמה של המשפחה:');
  
        if (!familyUsername || !password) {
          Alert.alert('יש להזין שם משתמש וסיסמה תקינים.');
          return;
        }
  
        const familyDoc = await getDoc(doc(db, 'families', familyUsername));
        if (!familyDoc.exists()) {
          Alert.alert('משפחה לא נמצאה.');
          return;
        }
  
        const familyData = familyDoc.data();
        if (familyData.password !== password) {
          Alert.alert('סיסמה שגויה.');
          return;
        }
  
        await updateDoc(doc(db, 'families', familyUsername), {
          [`members.${user.uid}`]: user.displayName?.split(' ')[0] || '',
        });
  
        await setDoc(doc(db, 'users', user.uid), {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          email: user.email,
          fromEmail: true,
          familyUsername,
          familyName: familyData.familyName,
          gender: '',
          birthDate: null,
          personalUsername: user.uid,
          joinDate: new Date().toISOString(),
        });
  
        Alert.alert('הצטרפת בהצלחה למשפחה הקיימת!');
        navigation.navigate('Family', { familyUsername, personalUsername: user.uid });
      } else if (action === '2') {
        // שלבים ליצירת משפחה חדשה
      } else {
        Alert.alert('בחירה לא תקינה');
      }
    } catch (error) {
      console.error('שגיאה בכניסה: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>כניסה</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="שם משתמש"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholder="סיסמה"
        />
        <Button title={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'} onPress={() => setShowPassword(!showPassword)} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="התחבר" onPress={handleLogin} />
        <Button title="רישום" onPress={() => navigation.navigate('Register')} />
      </View>
      <View style={styles.socialButtons}>
        <Button title="התחבר עם Google" onPress={() => handleSocialLogin()} />
        <Button title="התחבר עם Facebook" onPress={() => handleSocialLogin()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  passwordContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  socialButtons: {
    marginTop: 20,
  },
});

export default Login;