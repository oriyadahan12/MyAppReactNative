import React, { useState } from 'react';
import { Switch, Button, ScrollView, View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet, ImageBackground} from "react-native";
import { getFirestore, doc, setDoc, getDoc, Timestamp, query, collection, where, getDocs, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";

const db = getFirestore();

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [familyUsername, setFamilyUsername] = useState('');
  const [personalUsername, setPersonalUsername] = useState('');
  const [joiningExistingFamily, setJoiningExistingFamily] = useState(false);
  const [familyPassword, setFamilyPassword] = useState('');
  const [showFamilyPassword, setShowFamilyPassword] = useState(false);
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\p{L})(?=.*\d)[^\s]{6,}$/u;
    return passwordRegex.test(password);
  };

  const validateBirthDate = (date) => {
    const birth = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return age >= 18 && age <= 50 && birth < today;
  };

  const handleRegister = async () => {
    if (!firstName || !familyName || !birthDate || !gender || !email || !password || !familyUsername || !personalUsername) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים.');
      return;
    }

    if (!validateBirthDate(birthDate)) {
      Alert.alert('שגיאה', 'עליך להיות מעל גיל 18 ומתחת לגיל 50.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('שגיאה', 'כתובת האימייל אינה תקינה.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('שגיאה', 'הסיסמה צריכה להכיל לפחות 6 תווים, אות אחת וספרה אחת.');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', personalUsername));
      if (userDoc.exists()) {
        Alert.alert('שגיאה', 'שם המשתמש כבר תפוס.');
        return;
      }

      const emailQuery = query(collection(db, 'users'), where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        Alert.alert('שגיאה', 'כתובת האימייל כבר קיימת במערכת.');
        return;
      }

      let familyRef = doc(db, 'families', familyUsername);
      if (joiningExistingFamily) {
        const familyDoc = await getDoc(familyRef);
        if (!familyDoc.exists() || familyDoc.data().password !== familyPassword) {
          Alert.alert('שגיאה', 'שם משתמש משפחתי לא קיים או שסיסמת המשפחה שגויה.');
          return;
        }
        const creatorId = familyDoc.data().creatorId;
        if (creatorId) {
          const notificationRef = doc(db, 'notifications', creatorId);
          await setDoc(notificationRef, {
            message: `משתמש חדש ${personalUsername} הצטרף למשפחה.`,
            timestamp: Timestamp.fromDate(new Date())
          }, { merge: true });
        }
      } else {
        const familyDoc = await getDoc(familyRef);
        if (familyDoc.exists()) {
          Alert.alert('שגיאה', 'שם משתמש משפחתי כבר תפוס.');
          return;
        }
        // await setDoc(familyRef, { familyUsername, password, familyName, children: {} });
        await setDoc(familyRef, { 
          familyUsername, 
          password, 
          familyName, 
          creatorId: personalUsername, // נשמור מי יצר את המשפחה
          children: {} 
        });
      }

      await setDoc(doc(db, 'users', personalUsername), {
        personalUsername,
        password,
        firstName,
        familyName,
        birthDate: Timestamp.fromDate(new Date(birthDate)),
        gender,
        email,
        familyUsername,
        joinedAt: Timestamp.fromDate(new Date()),
      });

      await updateDoc(familyRef, { [`members.${personalUsername}`]: firstName });

      Alert.alert('הרשמה הושלמה!', 'ברוך הבא!');
      navigation.navigate('Family', { familyUsername, personalUsername });
    } catch (error) {
      console.error('שגיאה בהרשמה:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה במהלך הרישום. נסה שוב.');
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background2.jpg")}
      style={styles.background}
    >
    <View style={styles.container}>
      <Text style={styles.title}>רישום</Text>
      <View style={styles.inputContainer}>
        <Icon name="user" size={20} color="#6A0572" style={{ left: 10 }} />
        <TextInput
          placeholder="שם פרטי"
          style={styles.input}
          value={firstName}
          onChangeText={(text) =>setFirstName(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="שם משפחה"
          style={styles.input}
          value={familyName}
          onChangeText={(text) =>setFamilyName(text)}
        />
      </View>
      {/* תאריך לידה */}
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.label}>תאריך לידה</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar" size={20} color="#fff" />
          <Text style={styles.buttonText}>בחר תאריך</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate)
                setBirthDate(selectedDate.toISOString().split("T")[0]);
            }}
          />
        )}

        {birthDate && (
          <Text style={styles.selectedText}>
            תאריך שנבחר: {birthDate}
          </Text>
        )}
      </View>  
      {/* מגדר */}
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.label}>מגדר</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "זכר" && styles.selected,
            ]}
            onPress={() => setGender("זכר")}
          >
            <Text style={styles.genderButtonText}>זכר</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "נקבה" && styles.selected,
            ]}
            onPress={() => setGender("נקבה")}
          >
            <Text style={styles.genderButtonText}>נקבה</Text>
          </TouchableOpacity>
        </View>
      </View>    
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="דואר אלקטרוני"
          style={styles.input}
          value={email}
          onChangeText={(text) =>setEmail(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="שם משתמש אישי"
          style={styles.input}
          value={personalUsername}
          onChangeText={(text) => setPersonalUsername(text)}
        />
      </View>
      <View style={styles.inputContainer}>
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Icon name={showPassword ? "eye" : "eye-slash"} size={20} color="rgb(102, 23, 102)" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholder="סיסמה"
        />
      </View>
      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
       <Switch
          value={joiningExistingFamily}
          onValueChange={setJoiningExistingFamily}
        />
        <Text>האם תרצה להצטרף למשפחה קיימת?</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="שם משתמש משפחתי (למשפחה חדשה בלבד)"
          style={styles.input}
          value={familyUsername}
          onChangeText={(text) => setFamilyUsername(text)}
        />
      </View>
      {joiningExistingFamily && (
        <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShowFamilyPassword(!showFamilyPassword)} style={styles.eyeIcon}>
            <Icon name={showFamilyPassword ? "eye" : "eye-slash"} size={20} color="rgb(102, 23, 102)" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            secureTextEntry={!showFamilyPassword}
            value={familyPassword}
            onChangeText={setFamilyPassword}
            placeholder="סיסמת משפחה"
          />
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>בצע רישום</Text>
      </TouchableOpacity>
    </View>
          {/* <Image source={require("../../assets/Baby.png")} style={styles.icon} /> */}
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
    padding: 16, 
    backgroundColor: "rgba(253, 251, 253, 0.5)", 
    flex: 1, 
    borderRadius: 20, 
    margin: 10 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 16, 
    textAlign: "center", 
    color: "#6A0572" 
  },
  label: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#6A0572", 
    textAlign: "right"
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderWidth: 1, borderRadius: 16, 
    padding: 5, backgroundColor: "#fff", 
    marginBottom: 10
  },
  input: { 
    flex: 1, 
    marginLeft: 8 
  },
  button: {
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#6A0572", 
    padding: 10, borderRadius: 16, 
    justifyContent: "center", 
    marginBottom: 8 
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    marginLeft: 8
  },
  genderContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginTop: 8 
  },
  genderButton: {
    width: 100, // קובע רוחב קבוע לכפתורים
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10, // רווח בין הכפתורים
    borderWidth: 1,
    marginTop: 4,
    borderColor: "#6A0572" 
  },
  genderButtonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    marginLeft: 8, 
    color:"#6A0572"
  },
  selected: { 
    backgroundColor:'rgba(163, 107, 162, 0.57)', 
    borderColor: "#6A0572" 
  },
  addButton: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 20 
  },
  icon: { 
    width: 100, 
    height: 110, 
    position: "absolute", // מאפשר למקם אותו בלי להשפיע על שאר האלמנטים
    bottom: 10, 
    right: 20, // מזיז אותו לצד שמאל
  },
});

export default Register;