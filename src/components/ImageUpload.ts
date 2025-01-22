import { supabase } from '../util/supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface PhotoFile {
  name?: string;
  type: string;
  uri: string;
}

// פונקציה לבקשת הרשאות גישה לגלריה
export const requestPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return false;
    }
    return true;
  }
  return true;
};

// פונקציה לבחירת תמונה מהגלריה
export const pickImage = async () => {
  const hasPermission = await requestPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // חיתוך ריבועי
    quality: 1,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = uri.split('/').pop();

    const file: PhotoFile = {
      name: fileName,
      type: 'image/jpeg',
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    };

    return file;
  }
  return null;
};


export const uploadImage = async (file: PhotoFile, childId: string): Promise<string | null> => {
  try {
    // קבלת הסיומת של הקובץ, ואם לא קיימת, ברירת מחדל ל-jpg
    const fileExt = file.name?.split('.').pop() || 'jpg';

    // יצירת שם הקובץ המלא הכולל את תיקיית ה-childId
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${childId}/${fileName}`; // שמירה בתיקייה בשם הילד

    console.log(`Uploading file to: ${filePath}`);

    // יצירת אובייקט FormData עם הקובץ
    const formData = new FormData();
    formData.append('file', file as any);

    // העלאת הקובץ ל-Supabase
    const { data, error } = await supabase.storage
      .from('child-photos')
      .upload(filePath, formData, {
        cacheControl: '3600',
        upsert: false, // אל תדרוס קבצים קיימים
      });

    if (error) throw error; // טיפול בשגיאות

    // קבלת הקישור הציבורי לתמונה שהועלתה
    const { data: publicUrl } = supabase.storage
      .from('child-photos')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl; // החזרת הקישור הציבורי
  } catch (error) {
    console.error('Error uploading image:', error); // הדפסת שגיאה לקונסול
    throw error; // השלכת השגיאה כדי שניתן יהיה לטפל בה במקום אחר
  }

};


export const deleteImage = async (filePath: string): Promise<void> => {
  try {
    console.log(`Deleting file from: ${filePath}`);

    // קריאה לפונקציית המחיקה ב-Supabase
    const { error } = await supabase.storage
      .from('child-photos') // שם הבאקט
      .remove([filePath]); // מחיקת הקובץ לפי הנתיב

    if (error) {
      console.error('Error deleting image:', error.message); // טיפול בשגיאה
      throw error; // השלכת השגיאה
    }

    console.log(`File deleted successfully: ${filePath}`);
  } catch (error) {
    console.error('Failed to delete image:', error); // טיפול בשגיאה כללית
    throw error; // השלכת השגיאה כדי לאפשר טיפול חיצוני
  }
};
