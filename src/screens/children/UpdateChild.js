import React, { useState, useEffect } from "react";
import {View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ImageBackground, ScrollView} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs} from "firebase/firestore";
import { db} from '../../util/firebaseConfig';
import Icon from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import { uploadImage, pickImage, deleteImage, moveAllFiles} from '../../components/ImageUpload';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Header from '../../components/header'; // ייבוא הקומפוננטה של הסרגל

const UpdateChild = () => {
  const route = useRoute();
  const { childId} = route.params;
  const [childData, setChildData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState(null);
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const childDocRef = doc(db, "childrens", childId);
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          const data = childDocSnap.data();
          const formattedData = {
            ...data,
            birthDate: new Date(data.birthDate.seconds * 1000)
              .toISOString()
              .split("T")[0],
          };
          setChildData(formattedData);
          setOriginalData(formattedData);
          setImage(formattedData.photoUrl);
        } else {
          console.error("לא נמצא מסמך עבור הילד עם ID:", childId);
        }
      } catch (error) {
        console.error("שגיאה בשליפת נתוני הילד:", error);
      }
    };

    fetchChildData();
  }, [childId]);


  // פונקציית וולידציה לתאריך לידה
  const validateBirthDate = (date) => {
    const birth = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return birth < today && age < 21;
  };

  function validateID(id) {
    return /^\d{9}$/.test(id);
  }

  const validateForm = () => {
    const newErrors = [];
  
    if (!childData.name?.trim()) {
      newErrors.push("שם הילד הוא שדה חובה.");
    }

    if (!childData.birthDate) {
      newErrors.push("תאריך לידה הוא שדה חובה.");
    } else if (!validateBirthDate(childData.birthDate)) {
      newErrors.push("תאריך הלידה אינו תקין (הילד חייב להיות מתחת לגיל 21).");
    }

    if (!childData.gender || childData.gender === "") {
      newErrors.push("יש לבחור מין.");
    }

    if (!childData.idNumber?.trim()) {
      newErrors.push("תעודת זהות היא שדה חובה.");
    }

    if (!validateID(childData.idNumber)) {
      newErrors.push("תעודת זהות צריכה להיות בעלת 9 ספרות.");
    }

    if (newErrors.length > 0) {
      Alert.alert("שגיאות בטופס", newErrors.join("\n"));
      return false;
    }

    return true;
  };

  // בדיקה אם ID קיים כבר במערכת
  const checkIdExists = async (newId) => {
    if (newId === originalData.idNumber) return false;
    
    const childrenRef = collection(db, "childrens");
    const q = query(childrenRef, where("idNumber", "==", newId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

// שינויים בהעלאת הנתונים ל-Firestore
  const handleUpdateChild = async () => {
    try {
      // בדיקת תקינות הטופס
      if (!validateForm()) {
        return;
      }

      const isNameChanged = originalData.name !== childData.name;
      const isIdChanged = originalData.idNumber !== childData.idNumber;

      // בדיקה אם ה-ID החדש כבר קיים
      if (isIdChanged) {
        const idExists = await checkIdExists(childData.idNumber);
        if (idExists) {
          Alert.alert("שגיאה", "קיים כבר ילד עם תעודת זהות זו במערכת.");
          return;
        }
      }

      if (newImage) {
        try {
          childData.photoUrl = await uploadImage(newImage, childData.idNumber, '');
        } catch (error) {
          console.error("Error uploading photo:", error);
          alert("שגיאה בהעלאת התמונה. הילד יתעדכן ללא תמונה.");
        }
      }

      // עדכון במסמך המשפחה אם השם או ה-ID השתנו
      if (isNameChanged || isIdChanged || newImage) {
        const familyDocRef = doc(db, "families", childData.familyUsername);
        const familySnapshot = await getDoc(familyDocRef);

        if (!familySnapshot.exists()) {
          Alert.alert("שגיאה", "משפחה זו לא קיימת במערכת.");
          return;
        }

        const familyData = familySnapshot.data();
        const updatedChildren = { ...familyData.children };


        updatedChildren[childId].idNumber=childData.idNumber;
        updatedChildren[childId].name=childData.name;
          updatedChildren[childId].photoUrl = childData.photoUrl;

        
        await setDoc(familyDocRef, {
          ...familyData,
          children: updatedChildren,
        });
      }

        const childDocRef = doc(db, "childrens", childId);
        await setDoc(childDocRef, {
          ...childData,
          birthDate: new Date(childData.birthDate),
        });

        Alert.alert("הצלחה", "פרטי הילד עודכנו בהצלחה!");
        navigation.goBack();
      // }
    } catch (error) {
      console.error("שגיאה בעדכון פרטי הילד:", error);
      Alert.alert("שגיאה", "שגיאה בעדכון פרטי הילד");
    }
  };


  const confirmDelete = (note) => {
    return new Promise((resolve) => {
      Alert.alert(
        "אישור מחיקה",
        note,
        [{text: "לא",
            onPress: () => resolve(false), // מחזיר false אם בחר 'לא'
            style: "cancel"
          },
          {text: "כן",
            onPress: () => resolve(true), // מחזיר true אם בחר 'כן'
          }]
      );
    });
  };

  const handleDeleteChild = async () => {
    try {
      const isConfirmed = await confirmDelete("האם אתה בטוח שברצונך למחוק את פרטי הילד? פעולה זו אינה ניתנת לביטול."); // שואל את המשתמש אם הוא בטוח

      if (!isConfirmed) {
        // אם המשתמש לא אישר, אנחנו לא מבצעים את המחיקה
        console.log("המשתמש בחר לא למחוק את הילד");
        return;
      }

      const childDocRef = doc(db, "childrens", childId);
      const familyDocRef = doc(db, "families", childData.familyUsername);
      const familySnapshot = await getDoc(familyDocRef);
      const familyData = familySnapshot.data();
      const updatedChildren = { ...familyData.children };
      
      delete updatedChildren[childId]; // מחיקת הילד מהמפה
      
      await setDoc(familyDocRef, {
        ...familyData,
        children: updatedChildren
      });

      await deleteDoc(childDocRef); // מחיקת מסמך הילד

      Alert.alert("הצלחה", "הילד נמחק בהצלחה!");
      navigation.pop(2); // חזרה למסך הקודם
    } 
    catch (error) {
      console.error("שגיאה במחיקת פרטי הילד:", error);
      Alert.alert("שגיאה", "שגיאה במחיקת הילד");
    }
  };

  const handlePickImage = async () => {
    const photo = await pickImage();
    if (photo) {
      setNewImage(photo);
    }
  };

  const handleDeletePhoto = async (photo) => {
    try {
      const isConfirmed = await confirmDelete("האם אתה בטוח שברצונך למחוק את התמונה? פעולה זו אינה ניתנת לביטול."); // שואל את המשתמש אם הוא בטוח
  
      if (!isConfirmed) {
        // אם המשתמש לא אישר, אנחנו לא מבצעים את המחיקה
        console.log("המשתמש בחר לא למחוק את התמונה");
        return;
      }

    childData.photoUrl = null;

    const familyDocRef = doc(db, "families", childData.familyUsername);
    const familySnapshot = await getDoc(familyDocRef);

    if (!familySnapshot.exists()) {
      Alert.alert("שגיאה", "משפחה זו לא קיימת במערכת.");
      return;
    }

    const familyData = familySnapshot.data();
    const updatedChildren = { ...familyData.children };

      console.log(image) 
      updatedChildren[childId].photoUrl=null;

    await setDoc(familyDocRef, {
      ...familyData,
      children: updatedChildren,
    });
      
        setImage(null)
        setNewImage(null)
        Alert.alert("הצלחה", "התמונה נמחקה בהצלחה!");
        // navigation.pop(2); // חזרה למסך הקודם
      } catch (error) {
        console.error("שגיאה במחיקת התמונה", error);
        Alert.alert("שגיאה", "שגיאה במחיקת התמונה");
      }
  };

  if (!childData) {
    return <Text>טוען נתוני ילד...</Text>;
  }


  return (
    <ImageBackground source={require("../../assets/background2.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Header />
        <ScrollView style={{ flex: 1, marginTop: 10 }}>
          <Text style={styles.title}>עדכון פרטי הילד</Text>
  
          {/* שם הילד */}
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#6A0572" style={{ left: 10 }} />
            <TextInput
              placeholder="שם הילד"
              style={styles.input}
              value={childData.name}
              onChangeText={(text) => setChildData({ ...childData, name: text })}
            />
          </View>
  
          {/* תאריך לידה */}
            <View style={{marginBottom: 12}}>
            <Text style={styles.label}>תאריך לידה</Text>
            <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
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
                  if (selectedDate) {
                    setChildData({
                      ...childData,
                      birthDate: selectedDate.toISOString().split("T")[0],
                    });
                  }
                }}
              />
            )}
            {childData.birthDate && (
              <Text style={styles.selectedText}>תאריך שנבחר: {childData.birthDate}</Text>
            )}
          </View>
  
          {/* תעודת זהות */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="תעודת זהות"
              style={styles.input}
              value={childData.idNumber}
              onChangeText={(text) => setChildData({ ...childData, idNumber: text })}
            />
          </View>
  
          {/* מגדר ותמונה */}
          <View style={styles.rowContainer}>
            <View style={{marginBottom: 16}}>
              <Text style={styles.label}>מגדר</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, childData.gender === "זכר" && styles.selected]}
                  onPress={() => setChildData({ ...childData, gender: "זכר" })}
                >
                  <Text style={styles.genderButtonText}>זכר</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, childData.gender === "נקבה" && styles.selected]}
                  onPress={() => setChildData({ ...childData, gender: "נקבה" })}
                >
                  <Text style={styles.genderButtonText}>נקבה</Text>
                </TouchableOpacity>
              </View>
            </View>
  
            {/* תמונה */}
            <View style={styles.imageContainer}>
              <TouchableOpacity style={styles.imageWrapper} onPress={handlePickImage}>
                {newImage || image ? (
                  <Image source={{ uri: newImage?.uri || image }} style={styles.image} />
                ) : (
                  <Icon name="camera" size={40} color="#aaa" />
                )}
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>בחר תמונה</Text>
                </View>
              </TouchableOpacity>
              {(newImage || image) && (
                <TouchableOpacity onPress={handleDeletePhoto}>
                  <Text style={styles.deleteText}>מחק תמונה</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
  
          {/* כפתורים */}
          <View style={{marginTop: 6, width:120}}>
            <TouchableOpacity style={styles.button} onPress={handleUpdateChild}>
              <FontAwesome5 name="edit" size={20} color="#fff" />
              <Text style={styles.buttonText}>עדכן פרטים</Text>
            </TouchableOpacity>
  
            <TouchableOpacity 
            style={[styles.button, {backgroundColor: "#A15EA0"}]} 
            onPress={handleDeleteChild}>
              <Icon name="trash" size={18} color="#fff" />
              <Text style={styles.buttonText}>מחק ילד</Text>
            </TouchableOpacity>
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
    borderWidth: 1, 
    borderRadius: 16, 
    padding: 5, 
    backgroundColor: "#fff", 
    marginBottom: 10
  },
  input: { 
    flex: 1, 
    marginLeft: 8 
  },
  button: {
    // width: 140, 
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
  rowContainer: {
    flexDirection: "row-reverse", // מסדר את המגדר בצד ימין ואת התמונה בצד שמאל
    alignItems: "center", // ממרכז את האלמנטים לגובה אחיד
    justifyContent: "space-between", // רווח בין האלמנטים
  },
  imageContainer: {
    alignItems: "center", // ממרכז את התמונה
    justifyContent: "center",
    marginVertical: 20,
    marginLeft: 20, // מוסיף רווח מהמגדר
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f0f0f0", // רקע כשאין תמונה
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // מכסה את כל הריבוע
    backgroundColor: "rgba(58, 53, 53, 0.24)", // רקע שקוף כהה
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },
  overlayText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: "rgba(177, 50, 28, 0.69)",
    marginLeft: 5,
    fontWeight: "bold",
  },
  babyIcon: { 
    width: 100, 
    height: 110, 
    position: "absolute", // מאפשר למקם אותו בלי להשפיע על שאר האלמנטים
    bottom: 10, 
    right: 20, // מזיז אותו לצד שמאל
  }
});

export default UpdateChild;
