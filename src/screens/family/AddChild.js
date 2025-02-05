import { uploadImage, pickImage } from '../../components/ImageUpload';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, Timestamp , query, where,} from 'firebase/firestore';
import { db } from '../../util/firebaseConfig';
import React, { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet, ImageBackground} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import Header from '../../components/header'; // ייבוא הקומפוננטה של הסרגל

const AddChild = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { familyUsername } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [childData, setChildData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    photo: null,
  });

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) {
      setChildData({ ...childData, photo: image });
    }
  };

  const validateBirthDate = (date) => {
    const birth = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return birth < today && age < 21;
  };

  function validateID(id) {
    return /^\d{9}$/.test(id);
  }

  // בדיקה אם ID קיים כבר במערכת
  const checkIdExists = async (newId) => {
    
    const childrenRef = collection(db, "childrens");
    const q = query(childrenRef, where("idNumber", "==", newId));
    const querySnapshot = await getDocs(q);
    console.log(!querySnapshot.empty)
    return !querySnapshot.empty;
  };

  const handleAddChild = async () => {
    if (!childData.name || !childData.birthDate || !childData.gender) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות החובה!');
      return;
    }

    if (!validateBirthDate(childData.birthDate)) {
      Alert.alert('שגיאה', 'תאריך הלידה לא תקין או גדול מדי (ניתן להוסיף ילד עד גיל 20)');
      return;
    }

    if (!validateID(childData.idNumber)) {
      Alert.alert("תעודת זהות צריכה להיות בעלת 9 ספרות.");
      return;
    }

    try {
      const idExists = await checkIdExists(childData.idNumber);
      if (idExists) {
        Alert.alert("שגיאה", "קיים כבר ילד עם תעודת זהות זו במערכת.");
        return;
      }

      setLoading(true);

      const familyDoc = doc(db, "families", familyUsername);
      const familySnapshot = await getDoc(familyDoc);

      if (!familySnapshot.exists()) {
        alert("משפחה זו לא קיימת במערכת.");
        setLoading(false);
        return;
      }

      let photoUrl = null;
      if (childData.photo) {
        try {
          photoUrl = await uploadImage(childData.photo, childData.idNumber, '');
        } catch (error) {
          console.error("Error uploading photo:", error);
          alert("שגיאה בהעלאת התמונה. הילד יתווסף ללא תמונה.");
        }
      }

      // יצירת מסמך חדש עם id אוטומטי
      const childRef = await addDoc(collection(db, "childrens"), {
        name: childData.name,
        birthDate: Timestamp.fromDate(new Date(childData.birthDate)),
        gender: childData.gender,
        photoUrl: photoUrl || '',
        familyUsername: familyUsername,
        idNumber:childData.idNumber,
        "mileStones": [
  { "name": "עמדתי לבד", "date": null, "comments": "" },
  { "name": "מחאתי כפיים", "date": null, "comments": "" }
]
      //   mileStones: {
      //     'החיוך הראשון שלי': {
      //       date: null, //  תאריך ריק
      //       comments: "", // מחרוזת ריקה בשביל הערות
      //       document: null, // מסמך או תמונה ריק
      //     },
      //     'צחקתי': {
      //       date: null, //  תאריך ריק
      //       comments: "", // מחרוזת ריקה בשביל הערות
      //       document: null, // מסמך או תמונה ריק
      //     },
      //     'זחלתי': {
      //       date: null, //  תאריך ריק
      //       comments: "", // מחרוזת ריקה בשביל הערות
      //       document: null, // מסמך או תמונה ריק
      //     },

      //     'צמחה לי שן ראשונה': {
      //       date: null, //  תאריך ריק
      //       comments: "", // מחרוזת ריקה בשביל הערות
      //       document: null, // מסמך או תמונה ריק
      //     },

      //     'הצעד הראשון שלי': {
      //       date: null, //  תאריך ריק
      //       comments: "", // מחרוזת ריקה בשביל הערות
      //       document: null, // מסמך או תמונה ריק
      //     },
      //     'המילה הראשונה שלי': {
      //       date: null, //  תאריך ריק
      //       comments: "", // מחרוזת ריקה בשביל הערות
      //       document: null, // מסמך או תמונה ריק
      //     },
      
      //     'נגמלתי מטיטולים': {
      //       date: null, //  תאריך ריק
      //       comments: "", // מחרוזת ריקה בשביל הערות
      //       document: null, // מסמך או תמונה ריק
      //     },
      //   },
      });

      const childId = childRef.id; // קבלת ה-ID החדש שנוצר

      // עדכון מסמך המשפחה עם הילד החדש
      await updateDoc(familyDoc, {
        [`children.${childId}`]: {
          name: childData.name,
          idNumber: childData.idNumber,
          photoUrl: photoUrl || '',
        }
      });

      Alert.alert('הצלחה', 'הילד נוסף בהצלחה!');
      navigation.goBack();
      setChildData({ name: '', birthDate: '', gender: '', photo: null });
    } catch (error) {
      console.error('שגיאה בהוספת הילד: ', error);
      Alert.alert('שגיאה', 'אירעה שגיאה במהלך הוספת הילד. נסי שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ImageBackground
      source={require("../../assets/background2.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Header />
  
        <ScrollView style={{ flex: 1, marginTop: 10 }}>
          <Text style={styles.title}>הוספת ילד</Text>
  
          {/* שם הילד */}
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#6A0572" style={{ left: 10 }} />
            <TextInput
              placeholder="שם הילד"
              style={styles.input}
              value={childData.name}
              onChangeText={(text) =>
                setChildData({ ...childData, name: text })
              }
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
                    setChildData({
                      ...childData,
                      birthDate: selectedDate.toISOString().split("T")[0],
                    });
                }}
              />
            )}
  
            {childData.birthDate && (
              <Text style={styles.selectedText}>
                תאריך שנבחר: {childData.birthDate}
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
                  childData.gender === "זכר" && styles.selected,
                ]}
                onPress={() => setChildData({ ...childData, gender: "זכר" })}
              >
                <Text style={styles.genderButtonText}>זכר</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  childData.gender === "נקבה" && styles.selected,
                ]}
                onPress={() => setChildData({ ...childData, gender: "נקבה" })}
              >
                <Text style={styles.genderButtonText}>נקבה</Text>
              </TouchableOpacity>
            </View>
          </View>
  
          {/* תעודת זהות */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="תעודת זהות"
              style={styles.input}
              value={childData.idNumber}
              onChangeText={(text) =>
                setChildData({ ...childData, idNumber: text })
              }
            />
          </View>
  
          {/* העלאת תמונה */}
          <TouchableOpacity style={styles.button} onPress={handlePickImage}>
            <Icon name="camera" size={20} color="#fff" />
            <Text style={styles.buttonText}>בחר תמונה</Text>
          </TouchableOpacity>
  
          {childData.photo && (
            <Image source={{ uri: childData.photo.uri }} style={styles.preview} />
          )}
  
          {/* כפתורי פעולה */}
          <View style={styles.addButton}>
            {loading ? (
              <ActivityIndicator size="small" color="#6A0572" />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleAddChild}>
                <Text style={styles.buttonText}>הוסף ילד</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
  
      <Image source={require("../../assets/Baby.png")} style={styles.babyIcon} />
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
  preview: { 
    width: 100, 
    height: 100, 
    borderRadius: 16, 
    marginTop: 8 
  },
  addButton: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 20 
  },
  babyIcon: { 
    width: 100, 
    height: 110, 
    position: "absolute", // מאפשר למקם אותו בלי להשפיע על שאר האלמנטים
    bottom: 10, 
    right: 20, // מזיז אותו לצד שמאל
  }
});
export default AddChild;
