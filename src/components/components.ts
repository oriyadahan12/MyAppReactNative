import {Alert} from "react-native";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import {auth } from "../util/firebaseConfig";
import {Timestamp} from "firebase/firestore";

  // המרת האובייקט לסוג תאריך
  export const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("he-IL").format(date);
  };

//התנתקות מחשבון המשתמש
export const handleLogout = async () => {
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
            useNavigation().reset({
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