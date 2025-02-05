// Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Button, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // לאייקונים
import { useNavigation } from '@react-navigation/native';
import { signOut } from "firebase/auth";
import { auth } from "../util/firebaseConfig";
import styles  from "./styles";
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AntDesign } from '@expo/vector-icons';

const Header = () => {
  const navigation = useNavigation(); // כאן קוראים ל-hook של navigation
  const [modalVisible, setModalVisible] = React.useState(false);

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
            navigation.reset({ // כאן משתמשים ב-navigation שמתקבל דרך ה-hook
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

  const handleEditProfile = () => {
    // ניווט לעדכון פרטים אישיים
    // navigation.navigate('EditProfile');
  };

  const handleEditChild = () => {
    // ניווט לעדכון פרטי ילד
    // navigation.navigate('EditChild');
  };

  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      height: 50, // גובה מעט יותר ברור
      alignItems: 'center',
      paddingHorizontal: 0, 
      // backgroundColor: '#fff', // רקע בהיר כדי להבדיל מהתוכן
      // elevation: 4, // אפקט הצללה באנדרואיד
      // shadowColor: '#000', // צל ב-iOS
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: 0.1,
      // shadowRadius: 3,
      zIndex: 5 // לוודא שהתפריט יישאר למעלה
    }}>
      {/* כפתור חץ לחזרה אחורה */}
      <TouchableOpacity onPress={() => navigation.goBack()}
              style={  {width: 40,
                height: 40,
                top: 0,
                alignItems: "center",
                backgroundColor: "rgba(150, 107, 135, 0.46)",
                padding: 10,
                borderRadius: 20,
                justifyContent: "center",
                marginTop: 15}}
                >
<View>
  <AntDesign name="arrowleft" size={22} color="white" style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 }} />
</View>
</TouchableOpacity>

      {/* כפתור של שלוש נקודות */}
      <TouchableOpacity onPress={() => setModalVisible(true)} 
      style={  {width: 40,
        top: 0,
  height: 40,
  alignItems: "center",
  backgroundColor: "rgba(150, 107, 135, 0.46)",
  padding: 10,
  borderRadius: 20,
  justifyContent: "center",
  marginTop: 15}}>
    <View>
    <Ionicons name="ellipsis-vertical" size={20} color="white" style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 }} />
</View>
        {/* <Ionicons name="ellipsis-vertical" size={20} color="white" /> */}
      </TouchableOpacity>

      {/* מודל של האפשרויות */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(68, 58, 63, 0.63)' }}>
          <View style={{ backgroundColor: 'rgba(240, 232, 239, 0.82)', padding: 20, borderRadius: 10 }}>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={23} color="#fff" />
            <Text style={{ color: 'white', fontSize:15}}>התנתקות  </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={ handleEditProfile}>
            <FontAwesome5 name="edit" size={20} color="#fff" />
            <Text style={{ color: 'white', fontSize:15}}>עדכון פרטים אישיים  </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handleEditChild}>
          <MaterialCommunityIcons name="baby-face-outline" size={20} color="#fff" />
          <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
          <Text style={{ color: 'white', fontSize:15}}>עדכון פרטי ילד  </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
            <Icon name="close" size={20} color="#fff" />
            <Text style={{ color: 'white', fontSize:15}}>סגור  </Text>
          </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
};


export default Header;
