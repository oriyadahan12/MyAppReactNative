import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, Switch } from 'react-native';
import { getFirestore, doc, setDoc, getDoc, Timestamp, query, collection, where, getDocs, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const db = getFirestore();

const Register = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [familyName, setFamilyName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false); 
  const [familyUsername, setFamilyUsername] = useState<string>('');
  const [showFamilyPassword, setShowFamilyPassword] = useState<boolean>(false);
  const [personalUsername, setPersonalUsername] = useState<string>('');
  const [joiningExistingFamily, setJoiningExistingFamily] = useState<boolean>(false);
  const [familyPassword, setFamilyPassword] = useState<string>('');
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);


  // Enhanced email validation (English characters only)
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Enhanced password validation (Unicode letters from any language + digits)
  const validatePassword = (password: string) => {
    // At least 6 characters long
    // Contains at least one letter from any language and one number
    const passwordRegex = /^(?=.*\p{L})(?=.*\d)[^\s]{6,}$/u;
    return passwordRegex.test(password);
  };

  // Check if all required fields are filled
  const validateAllFields = () => {
    return (
      firstName.trim() !== '' &&
      familyName.trim() !== '' &&
      birthDate.trim() !== '' &&
      gender.trim() !== '' &&
      email.trim() !== '' &&
      password.trim() !== '' &&
      familyUsername.trim() !== '' &&
      personalUsername.trim() !== ''
    );
  };

  const handleRegister = async () => {
    if (!validateAllFields()) {
      Alert.alert('אנא מלא את כל השדות הנדרשים.');
      return;
    }
  
    if (!validateBirthDate(birthDate)) {
      Alert.alert('עליך להיות מעל גיל 18 ומתחת לגיל 50.');
      return;
    }
  
    if (!validateEmail(email)) {
      Alert.alert('כתובת האימייל אינה תקינה. אנא הזן כתובת אימייל תקינה באותיות אנגלית.');
      return;
    }
  
    if (!validatePassword(password)) {
      Alert.alert('הסיסמה צריכה להכיל לפחות 6 תווים, אות אחת וספרה אחת.');
      return;
    }
  
    try {
      const userDoc = await getDoc(doc(db, 'users', personalUsername));
      if (userDoc.exists()) {
        Alert.alert('שם המשתמש כבר תפוס. אנא בחר שם משתמש אחר.');
        return;
      }
  
      const emailQuery = query(collection(db, 'users'), where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        Alert.alert('כתובת הדואר האלקטרוני כבר קיימת במערכת. אנא בחר כתובת אחרת.');
        return;
      }
  
      let familyRef;
      if (joiningExistingFamily) {
        const familyDoc = await getDoc(doc(db, 'families', familyUsername));
        if (!familyDoc.exists()) {
          Alert.alert('שם משתמש משפחתי לא קיים.');
          return;
        }
        if (familyDoc.data().password !== familyPassword) {
          Alert.alert('סיסמת המשפחה שגויה.');
          return;
        }
        familyRef = doc(db, 'families', familyUsername);
      } else {
        // יצירת משפחה חדשה
        const familyDoc = await getDoc(doc(db, 'families', familyUsername));
        if (familyDoc.exists()) {
          Alert.alert('שם משתמש משפחתי כבר תפוס.');
          return;
        }
        familyRef = doc(db, 'families', familyUsername);

        // יצירת מסמך משפחה חדש
        await setDoc(familyRef, { 
          familyUsername,
          password: password, // סיסמה משפחתית
          familyName,
          members: {}, // רישום חברים כ-map
          children: {}, // יצירת map ריק בשם children
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
  
      await updateDoc(
        familyRef,
        { 
          [`members.${personalUsername}`]: firstName ,
        },
      );
  
      Alert.alert('הרשמה הושלמה בהצלחה!');
      navigation.navigate('Family', { familyUsername, personalUsername });
    } catch (error) {
      console.error('שגיאה בהרשמה: ', error);
      Alert.alert('אירעה שגיאה במהלך הרישום. נסה שוב.');
    }
  };
  

  const validateBirthDate = (date: string) => {
    const birth = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return age >= 18 && age <= 50 && birth < today;
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>רישום</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="שם פרטי"
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={familyName}
        onChangeText={setFamilyName}
        placeholder="שם משפחה"
      />
      <Text>תאריך לידה</Text>
        <Button title="בחר תאריך" onPress={() => setShowDatePicker(true)} />
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setBirthDate(selectedDate.toISOString().split('T')[0]);
            }}
          />
        )}
      <Text>{birthDate ? `תאריך שנבחר: ${birthDate}` : ''}</Text>
      <View>
        <Text>מגדר:</Text>
        <Button title="זכר" onPress={() => setGender('זכר')} />
        <Button title="נקבה" onPress={() => setGender('נקבה')} />
        <Text>{gender ? `מגדר שנבחר: ${gender}` : ''}</Text>
      </View>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={email}
        onChangeText={setEmail}
        placeholder="דואר אלקטרוני"
        keyboardType="email-address"
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={personalUsername}
        onChangeText={setPersonalUsername}
        placeholder="שם משתמש אישי"
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={password}
        onChangeText={setPassword}
        placeholder="סיסמה"
        secureTextEntry={!showPassword}
      />
      <Button
        title={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
        onPress={() => setShowPassword(!showPassword)}
      />
      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        <Switch
          value={joiningExistingFamily}
          onValueChange={setJoiningExistingFamily}
        />
        <Text>האם תרצה להצטרף למשפחה קיימת?</Text>
      </View>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
          value={familyUsername}
          onChangeText={setFamilyUsername}
          placeholder="שם משתמש משפחתי (למשפחה חדשה בלבד)"
        />
      {joiningExistingFamily && (
        <View>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
            value={familyPassword}
            onChangeText={setFamilyPassword}
            placeholder="סיסמת משפחה"
            secureTextEntry={!showFamilyPassword}  // אם showFamilyPassword = true, אז לא יוסתר
          />
          <Button
            title={showFamilyPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            onPress={() => setShowFamilyPassword(!showFamilyPassword)}
          />
        </View>
      )}
      <Button title="בצע רישום" onPress={handleRegister} />
    </View>
  );
};

export default Register;
