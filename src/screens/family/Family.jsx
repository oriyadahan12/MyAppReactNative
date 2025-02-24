import { signOut } from "firebase/auth";
import { auth } from "../../util/firebaseConfig"; // קובץ הקונפיגורציה של Firebase שלך
import { useParams, useNavigation ,  useRoute} from '@react-navigation/native'; // שינינו ל-RN Navigation
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../util/firebaseConfig';
import { Button, View, Text, TextInput,  TouchableOpacity, Image, ActivityIndicator, StyleSheet, ScrollView, ImageBackground } from "react-native";
import Header from '../../components/header'; // ייבוא הקומפוננטה של הסרגל
import styles from '../../components/styles'; 
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
const Family = () => {
  const route = useRoute(); // השתמש ב-useRoute ב-RN כדי לגשת ל-params
  const { familyUsername, personalUsername } = route.params;
  const [familyData, setFamilyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [children, setChildren] = useState({});
  const navigation = useNavigation(); // השתמשנו ב-hook של ניווט ב-RN

  console.log(familyUsername, personalUsername)
  useFocusEffect(
    useCallback(() => {
    const fetchFamilyData = async () => {
      try {
        const familyDocRef = doc(db, "families", familyUsername);
        const familyDocSnap = await getDoc(familyDocRef);

        if (familyDocSnap.exists()) {
          setFamilyData(familyDocSnap.data());
          const childrenData = familyDocSnap.data().children || {};
          if (childrenData) {
            setChildren(childrenData);
          }
        } else {
          console.error("מסמך המשפחה לא נמצא");
        }
      } catch (error) {
        console.error("שגיאה בעת שליפת פרטי המשפחה:", error);
      }
    };

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", personalUsername);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.error("מסמך המשתמש לא נמצא");
        }
      } catch (error) {
        console.error("שגיאה בעת שליפת פרטי המשתמש:", error);
      }
    };

    fetchFamilyData();
    fetchUserData();
  }, [familyUsername, personalUsername]));


  if (!familyData || !userData) {
    return <Text>טוען...</Text>; // השתמשנו ב-Text מ-RN במקום div
  }

  return (
    <ImageBackground 
      source={require("../../assets/background2.jpg")} 
      style={styles.background}
    >
      <View style={styles.container}>
        <Header />
  
        <ScrollView style={{ flex: 1, marginTop: 10 }}>
          <Text style={styles.header}>שלום {userData.firstName}</Text>
          <Text style={{ fontSize: 24, textAlign: 'center', color: '#6A0572', fontWeight: 'bold', textShadowColor: 'rgba(63, 19, 57, 0.23)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4}}>
            ברוכים הבאים
          </Text>
          <Text style={{ fontSize: 24, textAlign: 'center', color: '#6A0572', fontWeight: 'bold', textShadowColor: 'rgba(63, 19, 57, 0.23)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4}}>
            למשפחת {familyData.familyName}
          </Text>
  
          <View style={currentStyles.childrenContainer}>
            <Text style={styles.header}>ילדי המשפחה</Text>
  
            <View style={currentStyles.childrenWrapper}>
              {children && Object.keys(children).length > 0 && (
                <View style={currentStyles.childrenGrid}>
                  {Object.entries(children).map(([childKey, childData]) => (
                    <TouchableOpacity
                      key={childKey}
                      onPress={() => navigation.navigate('ChildCard', { childId: childKey })}
                      style={currentStyles.childContainer}
                    >
                      <ImageBackground 
                        source={{ uri: childData.photoUrl || 'https://via.placeholder.com/100' }} 
                        style={currentStyles.childImage}
                        imageStyle={{ borderRadius: 15 }}
                      >
                        <View style={currentStyles.overlay} />
                        <Text style={currentStyles.childText}>{childData.name}</Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
  
              <TouchableOpacity 
                style={currentStyles.addChildButton} 
                onPress={() => navigation.navigate('AddChild', { familyUsername })}
              >
                <Ionicons name="add" size={50} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );}
  export default Family;

  
  const currentStyles = StyleSheet.create({
    childrenContainer: {
      backgroundColor: 'rgba(141, 68, 119, 0.29)',
      borderRadius: 20,
      padding: 15,
      marginHorizontal: 10,
      marginTop: 10,
      alignItems: 'center', // Center children horizontally
    },
  
    childrenWrapper: {
      width: '100%', // Take full width of parent
      alignItems: 'center', // Center children horizontally
    },
  
    childrenGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center', // Center children horizontally
      gap: 10,
      width: '100%', // Take full width of parent
    },
  
    childContainer: {
      width: 100,
      height: 100,
      borderRadius: 45,
      overflow: 'hidden',
      margin: 5, // Add some margin between children
    },
  
    childImage: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 45,
    },
  
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(143, 125, 137, 0.25)',
      borderRadius: 45,
    },
  
    childText: {
      position: 'absolute',
      bottom: 10, // Moved text closer to bottom
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      textShadowColor: 'rgba(63, 19, 57, 0.23)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 4,
    },
  
    addChildButton: {
      width: 80,
      height: 80,
      alignItems: "center",
      backgroundColor: "#A15EA0",
      padding: 10,
      borderRadius: 45,
      justifyContent: "center",
      marginTop: 15,
    },
  });

