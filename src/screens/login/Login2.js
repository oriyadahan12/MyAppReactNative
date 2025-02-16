import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../../util/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_WEB_CLIENT_ID', // קבל את זה מ-Google Cloud Console
    // עבור אנדרואיד תצטרך גם:
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    // עבור iOS תצטרך גם:
    iosClientId: 'YOUR_IOS_CLIENT_ID',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleCredential(id_token);
    }
  }, [response]);

  const handleGoogleCredential = async (idToken) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // בדיקה אם המשתמש קיים במסד הנתונים
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // אם המשתמש קיים, נווט למסך המשפחה
        const { familyUsername } = userDoc.data();
        navigation.navigate('Family', { familyUsername, userId: user.uid });
      } else {
        // אם המשתמש לא קיים, נווט לרישום
        Alert.alert('ברוך הבא!', 'אנא השלם את תהליך הרישום');
        navigation.navigate('Register', { 
          email: user.email,
          userId: user.uid,
          displayName: user.displayName
        });
      }
    } catch (error) {
      console.error('שגיאה בהתחברות עם Google:', error);
      Alert.alert('שגיאה', 'שגיאה בהתחברות עם Google. אנא נסה שנית.');
    }
  };

  const handleEmailLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('שגיאה', 'נא למלא את כל השדות');
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        Alert.alert('שגיאה', 'המשתמש לא נמצא.');
        return;
      }

      const { familyUsername } = userDoc.data();
      navigation.navigate('Family', { familyUsername, userId: user.uid });

    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      let errorMessage = 'שגיאה בהתחברות. אנא נסה שנית.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'כתובת האימייל אינה תקינה';
          break;
        case 'auth/user-not-found':
          errorMessage = 'משתמש לא קיים';
          break;
        case 'auth/wrong-password':
          errorMessage = 'סיסמה שגויה';
          break;
      }
      
      Alert.alert('שגיאה', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>כניסה</Text>
      
      <TextInput
        style={styles.input}
        placeholder="אימייל"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.togglePasswordText}>
            {showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleEmailLogin} style={styles.loginButton}>
        <Text style={styles.buttonText}>התחבר</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => promptAsync()} 
        disabled={!request}
        style={styles.googleButton}
      >
        <Text style={styles.buttonText}>התחבר עם Google</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate('Register')} 
        style={styles.registerButton}
      >
        <Text style={styles.registerText}>משתמש חדש? לחץ כאן להרשמה</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    height: 40,
    borderBottomWidth: 1,
    marginBottom: 20,
    textAlign: 'right',
    paddingHorizontal: 10
  },
  passwordContainer: {
    width: '100%',
    marginBottom: 20
  },
  togglePasswordText: {
    textAlign: 'right',
    color: '#007bff',
    marginTop: 5
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10
  },
  googleButton: {
    backgroundColor: '#db4437',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  registerButton: {
    padding: 10
  },
  registerText: {
    color: '#007bff',
    fontSize: 14
  }
});

export default Login;
