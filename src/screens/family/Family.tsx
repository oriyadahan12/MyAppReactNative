import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { signOut } from "firebase/auth";
import { auth, db } from '../../util/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';


const Family = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { familyUsername, personalUsername } = route.params as { familyUsername: string; personalUsername: string };

  const [familyData, setFamilyData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [children, setChildren] = useState<any>({});

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        const familyDocRef = doc(db, "families", familyUsername);
        const familyDocSnap = await getDoc(familyDocRef);

        if (familyDocSnap.exists()) {
          const familyInfo = familyDocSnap.data();
          setFamilyData(familyInfo);
          setChildren(familyInfo.children || {});
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
  }, [familyUsername, personalUsername]);

  const handleLogout = async () => {
    Alert.alert(
      "התנתקות",
      "האם אתה בטוח שברצונך להתנתק?",
      [
        {
          text: "ביטול",
          style: "cancel",
        },
        {
          text: "אישור",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("שגיאה בעת התנתקות:", error);
            }
          },
        },
      ]
    );
  };

  if (!familyData || !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>טוען...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>שלום {userData.firstName}</Text>
      <Text style={styles.title}>ברוכים הבאים למשפחת {familyData.familyName}</Text>
      <Text style={styles.subtitle}>איזה פעולות תהיו מעוניינים לבצע?</Text>
  
      {Object.keys(children).length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>ילדי המשפחה:</Text>
          {Object.entries(children).map(([childName, childId]) => (
            <View key={String(childId)} style={styles.childButtonContainer}>
              <Button
                title={childName}
                onPress={() => navigation.navigate('ChildCard', { childId: String(childId) })}
              />
            </View>
          ))}
        </View>
      )}
  
      <View style={styles.buttonContainer}>
        <Button
          title="הוספת ילד למשפחה"
          onPress={() => navigation.navigate('AddChild', { familyUsername })}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="עדכון פרטים אישיים"
          onPress={() => navigation.navigate('UpdateDetails', { familyUsername, personalUsername })}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="התנתקות"
          color="red"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  childButtonContainer: {
    marginVertical: 8,
  },
  buttonContainer: {
    marginVertical: 10,
  },
});

export default Family;

