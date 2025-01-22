
import React, { useState } from 'react';
import { doc, updateDoc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import {auth, db } from '../../util/firebaseConfig';
import { supabase } from '../../util/supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import DateTimePicker from "@react-native-community/datetimepicker";
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View,  Platform, TouchableOpacity, Image,} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { signOut } from 'firebase/auth';
import { uploadImage, PhotoFile,  pickImage} from '../../components/ImageUpload';


// הגדרת טיפוס עבור נתוני הילד
interface ChildData {
  name: string;
  birthDate: string;
  gender: string;
  photo: PhotoFile | null;
  idNumber: string;
}

type RootStackParamList = {
  AddChild: { familyUsername: string };
};

type AddChildRouteProp = RouteProp<RootStackParamList, "AddChild">;

const AddChild = () => {
  const navigation = useNavigation();
  const route = useRoute<AddChildRouteProp>();
  const familyUsername = route.params?.familyUsername;
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [photo, setPhoto] = useState<string | null>(null); // שמור URI ולא File
  const [idNumber, setIdNumber] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [childData, setChildData] = useState<ChildData>({
    name: '',
    birthDate: '',
    gender: '',
    photo: null,
    idNumber: '',
  });

  const validateBirthDate = (date: string): boolean => {
    const birth = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return birth < today && age < 21;
  };

  const handleAddChild = async () => {
    if (!name || !birthDate || !gender || !idNumber) {
      Alert.alert("שגיאה", "יש למלא את כל השדות החובה!");
      return;
    }
  
    if (!validateBirthDate(birthDate)) {
      Alert.alert("שגיאה", "תאריך הלידה לא תקין או גדול מדי (ניתן להוסיף ילד עד גיל 20)");
      return;
    }
  
    setLoading(true); // התחלת טעינה
  
    try {
      const existingChildDoc = await getDoc(doc(db, "childrens", idNumber));
      if (existingChildDoc.exists()) {
        Alert.alert("שגיאה", "תעודת הזהות הזו כבר קיימת במערכת. אנא בדקו שנית.");
        setLoading(false);
        return;
      }
  
      const familyDoc = doc(db, "families", familyUsername);
      const familySnapshot = await getDoc(familyDoc);
  
      if (!familySnapshot.exists()) {
        Alert.alert("שגיאה", "משפחה זו לא קיימת במערכת.");
        setLoading(false);
        return;
      }
  
      let photoUrl = null;
      if (childData.photo) {
        console.log(childData.photo)
        try {
          photoUrl = await uploadImage(childData.photo, idNumber);
        } catch (error) {
          console.error("Error uploading photo:", error);
          Alert.alert("שגיאה", "שגיאה בהעלאת התמונה. הילד יתווסף ללא תמונה.");
        }
      }
      
  
      await updateDoc(familyDoc, {
        [`children.${name}`]: idNumber,
      });
  
      const childDoc = doc(db, "childrens", idNumber);
      await setDoc(childDoc, {
        name,
        birthDate: Timestamp.fromDate(new Date(birthDate)),
        gender,
        photoUrl,
        idNumber,
        familyUsername,
        growthStages: {
          'החיוך הראשון שלי': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'הרמתי את הראש בפעם הראשונה': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'התהפכתי מהבטן לגב': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'התהפכתי מהגב לבטן': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'צחקתי': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'החזקתי צעצוע לבד': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'אכלתי אוכל אמיתי': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'התחלת זחילת ציר': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'זחלתי': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'ישבתי לבד': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'צמחה לי שן ראשונה': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'עמדתי לבד': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'נופתתי לשלום': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'אכלתי לבד': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'מחאתי כפיים': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'הלכתי בעזרת חפץ': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'הלכתי לבד': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'המילה הראשונה שלי': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
          'הפסקתי לשתות חלב': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },          
          'נגמלתי מטיטולים': {
            date: null, //  תאריך ריק
            comments: "", // מחרוזת ריקה בשביל הערות
            document: null, // מסמך או תמונה ריק
          },
        },
      });
  
      Alert.alert("הצלחה", "הילד נוסף בהצלחה!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
  
      resetFields();
    } catch (error) {
      console.error("Error adding child:", error);
      Alert.alert("שגיאה", "אירעה שגיאה במהלך הוספת הילד. נסי שוב מאוחר יותר.");
    } finally {
      setLoading(false); // סיום טעינה
    }
  };
  

  const resetFields = () => {
    setName("");
    setBirthDate("");
    setGender("");
    setPhoto(null);
    setIdNumber("");
  };

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) {
      setChildData({ ...childData, photo: image });
    }
  };

  const handleLogout = async () => {
    Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
      {
        text: 'לא',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'כן',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('שגיאה בעת התנתקות:', error);
          }
        },
      },
    ]);
  };


  return (
    <View style={styles.container}>
   <Text style={styles.title}>הוסף ילד למשפחה {familyUsername}</Text>
      <TextInput
        style={styles.input}
        placeholder="שם הילד"
        value={name}
        onChangeText={setName}
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
            if (selectedDate) setBirthDate(selectedDate.toISOString().split("T")[0]);
          }}
        />
      )}
      <Text>{birthDate ? `תאריך שנבחר: ${birthDate}` : ""}</Text>
      <View>
        <Text>מגדר:</Text>
        <Button title="זכר" onPress={() => setGender("זכר")} />
        <Button title="נקבה" onPress={() => setGender("נקבה")} />
        <Text>{gender ? `מגדר שנבחר: ${gender}` : ""}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="תעודת זהות"
        value={idNumber}
        onChangeText={setIdNumber}
      />

      <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
        <Text style={styles.buttonText}>בחר תמונה</Text>
      </TouchableOpacity>

      {childData.photo && (
        <Image
          source={{ uri: childData.photo.uri }}
          style={styles.preview}
        />
      )}
      {loading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Button title="הוסף ילד" onPress={handleAddChild} />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
          <Text>חזור</Text>
        </TouchableOpacity> 

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="red" />
          <Text>התנתקות</Text>
        </TouchableOpacity>
      </View> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    textAlign: 'right',
  },
  imageButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preview: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 10,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  logoutButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default AddChild;

