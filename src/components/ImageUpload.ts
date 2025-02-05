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
export const pickImage = async (useCamera = false, cropSize = [1, 1]) => {
  const hasPermission = await requestPermission();
  if (!hasPermission) return null;

  let result;

  if (useCamera) {
    result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      // aspect: cropSize, // שימוש בגודל מותאם אישית
      quality: 1,
    });
  } else {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: cropSize, // שימוש בגודל מותאם אישית
      quality: 1,
    });
  }

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = uri.split("/").pop();

    const file: PhotoFile = {
      name: fileName,
      type: "image/jpeg",
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
    };

    return file;
  }

  return null;
};

  export const uploadImage = async (file: PhotoFile, childId: string, path: string): Promise<string | null> => {
    try {
      // קבלת הסיומת של הקובץ, ואם לא קיימת, ברירת מחדל ל-jpg
      const fileExt = file.name?.split('.').pop() || 'jpg';
  
      // יצירת שם הקובץ הייחודי
      const fileName = `${Date.now()}.${fileExt}`;
  
      // יצירת נתיב הקובץ בתוך תיקיית המשפחה ותיקיית הילד
      // const filePath = `${familyId}/${childId}/${path}/${fileName}`;
      const filePath = `${childId}/${path}/${fileName}`;

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

export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  console.log("Deleting file from path:");

  try {
    // חילוץ הנתיב מתוך ה-URL
    const baseUrl = "https://zwlbbpgtlzaeybzxrjbk.supabase.co/storage/v1/object/public/child-photos/";
    if (!imageUrl.startsWith(baseUrl)) {
      console.error("Invalid image URL:", imageUrl);
      return false;
    }

    const filePath = imageUrl.replace(baseUrl, "").replace(/\/{2,}/g, "/"); // מסיר כפילויות ב-"/"

    console.log("Deleting file from path:", filePath);

    // קריאה ל-Supabase כדי למחוק את הקובץ
    const { error } = await supabase.storage
      .from("child-photos")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }

    console.log("Image deleted successfully:", filePath);
    return true;
  } catch (error) {
    console.error("Unexpected error deleting image:", error);
    return false;
  }
};

export async function moveAllFiles(oldFolder:string, newFolder: string) {
  const bucket = 'child-photos'; // שם הבאקט שבו מאוחסנים הקבצים

  // 1️⃣ קבלת רשימת הקבצים בתיקייה הישנה
  const { data: files, error: listError } = await supabase
    .storage
    .from(bucket)
    .list(oldFolder);

    if (listError) {
    console.error("Error listing files:", listError);
    return;
  }

  // בדיקה אם יש קבצים בתיקייה
  if (!files || files.length === 0) {
    console.log("No files found in the folder.");
    return;
  }

  // 2️⃣ לולאה שמורידה, מעלה, ואז מוחקת כל קובץ
  for (const file of files) {
    const filePath = `${oldFolder}/${file.name}`;
    const newFilePath = `${newFolder}/${file.name}`;

    // הורדת הקובץ
    const { data, error: downloadError } = await supabase
      .storage
      .from(bucket)
      .download(filePath);

    if (downloadError) {
      console.error(`Error downloading ${file.name}:`, downloadError);
      continue;
    }

    // העלאת הקובץ לתיקייה החדשה
    const { error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(newFilePath, data, {
        contentType: file.metadata.mimetype || "image/jpeg",
      });

    if (uploadError) {
      console.error(`Error uploading ${file.name}:`, uploadError);
      continue;
    }

    // מחיקת הקובץ מהתיקייה הישנה
    await supabase
      .storage
      .from(bucket)
      .remove([filePath]);

    console.log(`✅ Moved ${file.name} to ${newFilePath}`);
  }

  console.log("🎉 All files moved successfully!");
  
//   const { data, error } = await supabase.storage
//   .from('child-photos')
//   .copy(
//     '123/1738517041450.jpeg',        // מיקום מקור
//     'new-folder/1738517041450.jpeg'  // מיקום יעד
//   )

// if (error) {
//   console.log('שגיאה בהעתקת הקובץ:', error)
//   return
// }

// // אחרי שהעתקה הצליחה, מחק את הקובץ המקורי
// const { error: deleteError } = await supabase.storage
//   .from('child-photos')
//   .remove(['123/1738517041450.jpeg'])
}
