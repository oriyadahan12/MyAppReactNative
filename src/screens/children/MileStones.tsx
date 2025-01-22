import React, { useState, useEffect } from "react";
import {Text, View, Button, TextInput, Alert, StyleSheet, ScrollView, TouchableOpacity, Image,} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { doc, getDoc, updateDoc, Timestamp, deleteField } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../util/firebaseConfig";
import { uploadImage, PhotoFile,  pickImage, deleteImage} from '../../components/ImageUpload';

interface ChildData {
  idNumber: string;
  name: string;
  birthDate: Timestamp;
  photoUrl?: string;
  growthStages: { [key: string]: StageData };
}

interface StageData {
  photo?: PhotoFile | null;
  photoUrl?: string | null;
  date: Timestamp | null;
  comments?: string;
}

const MileStones = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { childId } = route.params as { childId: string };
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editData, setEditData] = useState<StageData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState<string>("");
  const [imageError, setImageError] = useState<boolean>(false);

  // שליפת נתוני הילד לפי הid
  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const childDocRef = doc(db, "childrens", childId);
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          setChildData(childDocSnap.data() as ChildData);
        } else {
          setError("לא נמצא ילד עם ה-ID הזה");
        }
      } catch (err) {
        setError("שגיאה בעת שליפת נתוני הילד");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [childId]);

  // המרת האובייקט לסוג תאריך
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("he-IL").format(date);
  };

//שמירת הנתונים המעודכנים בשלב לאחר העריכה
  const handleSaveStage = async (stageName: string) => {
    if (!editData) return;
  
    try {
      const updatedData: StageData = {
        ...editData,
        date: editData.date ? Timestamp.fromDate(new Date(editData.date.toDate())) : null,
      };
  
      const childDocRef = doc(db, "childrens", childId);
      await updateDoc(childDocRef, {
        [`growthStages.${stageName}`]: updatedData,
      });
  
      setChildData((prevData) => {
        const updatedStages = {
          ...prevData?.growthStages,
          [stageName]: updatedData,
        };
        return { ...prevData, growthStages: updatedStages } as ChildData;
      });
  
      setEditingStage(null);
      Alert.alert("השמירה הצליחה", "השלב עודכן בהצלחה!");
    } catch (err) {
      console.error("שגיאה בעדכון שלב:", err);
      Alert.alert("שגיאה", "אירעה שגיאה בעת עדכון השלב.");
    }
  };
  
// 
  const handleEditStage = (stageName: string, stageData: StageData) => {
    setEditingStage(stageName);
    setEditData(stageData);
  };

  const handleDeleteStage = async (stageName: string) => {
    Alert.alert("אישור מחיקה", "האם אתה בטוח שברצונך למחוק את השלב?", [
      { text: "לא", style: "cancel" },
      {
        text: "כן",
        onPress: async () => {
          try {
            const childDocRef = doc(db, "childrens", childId);
            await updateDoc(childDocRef, {
              [`growthStages.${stageName}`]: deleteField(),
            });

            setChildData((prevData) => {
              const updatedStages = { ...prevData?.growthStages };
              delete updatedStages[stageName];
              return { ...prevData, growthStages: updatedStages } as ChildData;
            });

            setEditingStage(null);
            Alert.alert("מחיקה הצליחה", "השלב נמחק בהצלחה!");
          } catch (err) {
            console.error("שגיאה במחיקת שלב:", err);
            Alert.alert("שגיאה", "אירעה שגיאה בעת מחיקת השלב.");
          }
        },
      },
    ]);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // סגור את תיבת הבחירה
  
    if (selectedDate) {
      const today = new Date();
      
      if (!childData?.birthDate) {
        Alert.alert("שגיאה", "תאריך לידה לא זמין.");
        return;
      }
  
      const birthDate = childData?.birthDate.toDate(); // המרת ה-Timestamp לתאריך רגיל
  
      // אם התאריך לא תקין (לפני תאריך הלידה או אחרי היום)
      if (selectedDate < birthDate) {
        Alert.alert("שגיאה", "התאריך לא יכול להיות לפני תאריך הלידה של הילד.");
        return;
      }
  
      if (selectedDate > today) {
        Alert.alert("שגיאה", "התאריך לא יכול להיות אחרי תאריך היום.");
        return;
      }
  
      // אם התאריך תקין, עדכן את הסטייט
      setEditData((prev) => ({
        ...(prev || {}),
        date: Timestamp.fromDate(selectedDate),
      }));
    }
  };
  
  //סגירה של הלוח לבחירת תאריך לא שינוי
  const handleCancelDate = () => {
    setShowDatePicker(false); 
  };
  
  //מחיקת התאריך שנבחר
  const handleResetDate = () => {
    setEditData((prev) => ({
      ...(prev || {}),
      date: null, // מאפס את התאריך
    }));
  };
  
  //הוספת שלב חדש שלא קיים
  const handleAddNewStage = async () => {
    if (!newStageName.trim()) {
      Alert.alert("שגיאה", "שם שלב לא יכול להיות ריק.");
      return;
    }
  
    // נתוני השלב שנשמרים (נשתמש בערכים ברירת מחדל)
    const newStageData: StageData = {
      date: null, // תאריך ברירת מחדל - אפשר לעדכן מאוחר יותר
      comments: "", // הערות ברירת מחדל - אפשר לעדכן מאוחר יותר
    };
  
    try {
      const childDocRef = doc(db, "childrens", childId);
      await updateDoc(childDocRef, {
        [`growthStages.${newStageName}`]: newStageData,
      });
  
      // עדכון הנתונים לאחר שמירת השלב החדש
      setChildData((prevData) => {
        const updatedStages = {
          ...prevData?.growthStages,
          [newStageName]: newStageData,
        };
        return { ...prevData, growthStages: updatedStages } as ChildData;
      });
  
      setNewStageName(""); // ניקוי שם השלב לאחר השמירה
      setEditData(null); // ניקוי נתוני השלב
      Alert.alert("השלב נוסף בהצלחה", "השלב החדש נוסף בהצלחה!");
    } catch (err) {
      console.error("שגיאה בהוספת שלב:", err);
      Alert.alert("שגיאה", "אירעה שגיאה בעת הוספת השלב.");
    }
  };
  

  if (loading) return <Text>טוען נתונים...</Text>;
  if (error) return <Text>שגיאה: {error}</Text>;

  //התנתקות מחשבון המשתמש
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>מעקב התפתחות - {childData?.name}</Text>
      <View style={{ direction: "rtl" }}>
        {Object.entries(childData?.growthStages || {}).map(([stageName, stageData]) => (
          <View key={stageName} style={styles.stageContainer}>
            <Text style={styles.stageTitle}>{stageName}</Text>
            {editingStage === stageName ? (
              <View style={styles.editContainer}>
                <Button title="בחר תאריך" onPress={() => setShowDatePicker(true)} />
                {showDatePicker && (
                  <>
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                    <View style={styles.buttonRow}>
                      <Button title="ביטול" onPress={handleCancelDate} />
                    </View>
                  </>
                )}
  
                <Text>תאריך: {editData?.date ? formatDate(editData.date) : ""}</Text>
                <TextInput
                  value={editData?.comments || ""}
                  onChangeText={(text) =>
                    setEditData((prev) => ({
                      ...(prev || { date: null, comments: "" }),
                      comments: text,
                    }))
                  }
                  style={styles.textInput}
                  placeholder="הערות"
                  multiline
                />
  
                {/* כפתור לבחירת תמונה */}
                <Button
                  title="בחר תמונה"
                  onPress={async () => {
                    const photo = await pickImage();
                    if (photo) {
                      // מחיקת תמונה קודמת
                      if (editData?.photoUrl) {
                        await deleteImage(editData.photoUrl);
                      }

                      // העלאה ל-Firebase
                      const uploadedUrl = await uploadImage(photo, childId);
                      if (uploadedUrl) {
                        setEditData((prev) => ({
                          ...(prev || { date: null, comments: "" }),
                          photoUrl: uploadedUrl,
                        }));
                      }
                    }
                  }}
                />

                  {/* הצגת התמונה */}
                  {editData?.photoUrl && (
                    <Image
                      source={{ uri: editData.photoUrl }}
                      style={styles.preview}
                    />
                  )}
                    
                <View style={styles.buttonRow}>
                  <Button title="אפס תאריך" onPress={() => handleResetDate()} /> {/* כפתור לאיפוס התאריך */}
                  <Button
                  title="מחק תמונה"
                  onPress={async () => {
                    if (editData?.photoUrl) {
                      await deleteImage(editData.photoUrl); // מחיקת התמונה מהאחסון
                      setEditData((prev) => ({
                        ...(prev || { date: null, comments: "" }),
                        photoUrl: null, // מחיקת הקישור
                      }));
                    }
                  }}  color="red"/>
                </View>

                <View style={styles.buttonRow}>
                  <Button title="שמור" onPress={() => handleSaveStage(stageName)} />
                  <Button title="ביטול" onPress={() => setEditingStage(null)} />
                  <Button
                    title="מחק שלב"
                    onPress={() => handleDeleteStage(stageName)}
                    color="red"
                  />
                </View>
              </View>
            ) : (
              <>
                <Text>תאריך: {formatDate(stageData.date)}</Text>
                <Text>הערות: {stageData.comments}</Text>
                <View>
                {/* הצגת התמונה אם קיימת */}
                {stageData?.photoUrl && !imageError ?(
                  <Image
                    source={{ uri: stageData.photoUrl }}
                    style={{ width: 100, height: 100, marginVertical: 8 }}
                    onError={() => setImageError(true)}

                  />
                  ): ( <View ></View>)}
                </View>

  
                <Button title="ערוך" onPress={() => handleEditStage(stageName, stageData)} />
              </>
            )}
          </View>
        ))}
        <TextInput
          value={newStageName}
          onChangeText={setNewStageName}
          style={styles.textInput}
          placeholder="שם שלב חדש"
        />
        <Button title="הוסף שלב חדש" onPress={handleAddNewStage} />
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
    </ScrollView>
  );
};
  
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  stageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  stageTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#007acc',
    marginBottom: 8,
  },
  editContainer: {
    marginTop: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007acc',
    borderRadius: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e57373',
    borderRadius: 8,
  },
  preview: {
    width: '100%',
    height: 200,
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: '#007acc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});



export default MileStones;
