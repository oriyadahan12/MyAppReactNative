import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../util/firebaseConfig';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
// import {  Baby, Stethoscope, Syringe, Ruler, Edit } from 'lucide-react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// import Baby from './icons/Baby'; // דוגמה לייבוא של אייקון מותאם אישית
// import Stethoscope from './icons/Stethoscope';
// import Syringe from './icons/Syringe';
// import Ruler from './icons/Ruler';
// import Edit from './icons/Edit';
interface ChildData {
  idNumber: string;
  name: string;
  birthDate: Timestamp;
  photoUrl?: string;
}

const ChildCard = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { childId } = route.params as { childId: string };
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const childDocRef = doc(db, 'childrens', childId);
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          setChildData(childDocSnap.data() as ChildData);
        } else {
          console.error('לא נמצא ילד עם ה-ID הזה');
        }
      } catch (error) {
        console.error('שגיאה בעת שליפת נתוני הילד:', error);
      }
    };

    fetchChildData();
  }, [childId]);

  if (!childData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>טוען פרטי ילד...</Text>
      </View>
    );
  }

  const calculateAge = (birthTimestamp: Timestamp) => {
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

  const formatDate = (timestamp: Timestamp | Date) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('he-IL');
    }
    return new Date(timestamp).toLocaleDateString('he-IL');
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

  const age = calculateAge(childData.birthDate);

  return (
    <View style={styles.container}>

       <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
          {childData?.photoUrl && !imageError ? (
          <Image
            source={{ uri: childData.photoUrl }}
            style={styles.childImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.defaultImage}>
            <Icon name="person" size={40} color="gray" />
          </View>
        )}
        </View>
          <View style={styles.childInfo}>
            <Text style={styles.name}>{childData?.name}</Text>
            <Text>
              <Text style={styles.bold}>תעודת זהות:</Text> {childData?.idNumber}
            </Text>
            <Text>
              <Text style={styles.bold}>תאריך לידה:</Text> {childData?.birthDate.toDate().toLocaleDateString()}
            </Text>
            <Text>
            <Text style={styles.bold}>גיל:</Text>{' '}
            {age
              ? age.years === 0
                ? `${age.months} חודשים`
                : `${age.years} שנים ו-${age.months} חודשים`
              : 'לא זמין'}
            </Text>
          </View>
        </View>
        <View style={styles.container}>
      {/* כפתור להתפתחות הילד */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MileStones', { childId: childData.idNumber })}
      >
        <View style={styles.icon}>
          {/* <Baby width={24} height={24} /> */}
        </View>
        <Text style={styles.buttonText}>התפתחות הילד</Text>
      </TouchableOpacity>

      {/* כפתור לביקורים אצל הרופא
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('DoctorVisits', { idNumber: childData.idNumber })}
      >
        <View style={styles.icon}>
          <Stethoscope width={24} height={24} />
        </View>
        <Text style={styles.buttonText}>ביקורים אצל הרופא</Text>
      </TouchableOpacity> */}

      {/* //כפתור לחיסונים
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Vaccinations', { idNumber: childData.idNumber })}
      >
        <View style={styles.icon}>
          <Syringe width={24} height={24} />
        </View>
        <Text style={styles.buttonText}>חיסונים</Text>
      </TouchableOpacity> */}

      {/*// כפתור למעקב גדילה
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('GrowthSize', { idNumber: childData.idNumber })}
      >
        <View style={styles.icon}>
          <Ruler width={24} height={24} />
        </View>
        <Text style={styles.buttonText}>מעקב גדילה</Text>
      </TouchableOpacity> */}

      {/* כפתור לעדכון פרטי הילד */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('UpdateChild', { childId: childData.idNumber })}
      >
        <View style={styles.icon}>
          {/* <Edit width={24} height={24} /> */}
        </View>
        <Text style={styles.buttonText}>עדכון פרטי הילד</Text>
      </TouchableOpacity>
    </View>
      </View>

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
    padding: 16,
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginBottom: 16,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  childImage: {
    width: 112,
    height: 112,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  defaultImage: {
    width: 112,
    height: 112,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  childInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    width: 120,
    justifyContent: 'center',
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
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',}
});

export default ChildCard;
