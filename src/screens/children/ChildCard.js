
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ImageBackground, ScrollView} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../util/firebaseConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { User, LogOut, Baby, Stethoscope, Syringe, Ruler, Edit } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Header from '../../components/header'; // ייבוא הקומפוננטה של הסרגל
import { Timestamp } from 'firebase/firestore';

export const calculateAge = (birthTimestamp) => {
  const birthDate = birthTimestamp.toDate();
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (days < 0) {
    months--;
  }

  return { years, months };
};

const ChildCard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { childId} = route.params;
  const [childData, setChildData] = useState(null);
  const [imageError, setImageError] = useState(false);

useFocusEffect(
    useCallback(() => {
          const fetchChildData = async () => {
      try {
        const childDocRef = doc(db, 'childrens', childId);
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          setChildData(childDocSnap.data());
        } else {
          console.error('Child not found');
        }
      } catch (error) {
        console.error('Error fetching child data:', error);
      }
    };

    fetchChildData();
  }, [childId]));

  if (!childData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>טוען...</Text>
      </View>
    );
  }

  const age = calculateAge(childData.birthDate);


  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('he-IL');
    }
    return new Date(timestamp).toLocaleDateString('he-IL');
  };


  const navigationButtons = [
    { text: 'ציוני דרך', icon: <Icon2 name="footsteps" size={24} color="rgba(44, 13, 44, 0.88)" />, path: 'MileStones' },
    { text: 'ביקורים אצל הרופא', icon: <Icon name="stethoscope" size={24} color="rgba(44, 13, 44, 0.88)" />, path: 'DoctorVisits' },
    { text: 'טיפת חלב', icon: <Icon name="baby" size={24} color="rgba(44, 13, 44, 0.88)" />, path: 'DropOfMilk' },
    { text: 'חיסונים', icon: <Icon name="syringe" size={24} color="rgba(44, 13, 44, 0.88)" />, path: 'Vacinations' },
    { text: 'מעקב גדילה', icon: <Icon name="chart-line" size={24} color= 'rgba(44, 13, 44, 0.88)' />, path: 'GrowthSize' },
    { text: 'עדכון פרטי ילד', icon: <Icon name="edit" size={24} color="rgba(44, 13, 44, 0.88)" />, path: 'UpdateChild' },
  ];
  

  return (
    <ImageBackground source={require("../../assets/background2.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Header />
  
        <ScrollView style={{ flex: 1, marginTop: 10 }}>
          <View style={styles.card}>
            {childData.photoUrl && !imageError ? (
              <Image source={{ uri: childData.photoUrl }} style={styles.image} onError={() => setImageError(true)} />
            ) : (
              <View style={styles.placeholder}>
                <User size={40} color="#ccc" />
              </View>
            )}
            <Text style={styles.name}>{childData.name}</Text>
            <Text style={styles.cardText}>תעודת זהות: {childData.idNumber}</Text>
            <Text style={styles.cardText}>תאריך לידה: {formatDate(childData.birthDate)}</Text>
            <Text style={styles.cardText}>
              גיל: {age.years === 0 ? `${age.months} חודשים` : `${age.years} שנים ו-${age.months} חודשים`}
            </Text>
          </View>
  
          {/* כפתורים מסביב לפרטי הילד */}
          <View style={styles.buttonContainer}>
            {navigationButtons.map((button, index) => (
              <TouchableOpacity key={index} style={styles.roundButton} onPress={() => navigation.navigate(button.path, { childId })}>
                {button.icon}
                <Text style={styles.buttonText}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
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
  card: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: "100%",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholder: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 60,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "rgba(134, 26, 7, 0.81)"
  },

  cardText:{
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 2,
    color: "rgb(102, 23, 102)"
  },
  // כפתורים מסביב לכרטיס
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
  },
  roundButton: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor:'rgb(175, 138, 175)', 
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },
});

export default ChildCard;
