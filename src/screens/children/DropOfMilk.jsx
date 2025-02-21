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

const DropOfMilk = () => {
  const route = useRoute();
  const { childId} = route.params;
  const [childData, setChildData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);

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


  return (
    <ImageBackground source={require("../../assets/background2.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Header />
        <ScrollView style={{ flex: 1, marginTop: 10 }}>
          <Text style={styles.title}>טיפת חלב</Text>
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

export default DropOfMilk;
