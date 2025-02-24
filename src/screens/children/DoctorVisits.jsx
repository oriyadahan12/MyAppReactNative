import { View, Text, ImageBackground, TouchableOpacity, TextInput, Alert, Image, ScrollView, KeyboardAvoidingView,  ActivityIndicator, Modal, FlatList, StyleSheet} from "react-native";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, Timestamp} from "firebase/firestore";
import { db} from "../../util/firebaseConfig";
import {useRoute} from '@react-navigation/native'; // שינינו ל-RN Navigation
import DateTimePicker from "@react-native-community/datetimepicker";
import { uploadImage, pickImage} from '../../components/ImageUpload';
import Icon from "react-native-vector-icons/FontAwesome";
import Header from '../../components/header'; // ייבוא הקומפוננטה של הסרגל
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
  
const DoctorTypeOptions = [
  'אף אוזן גרון',
  'אורתופד',
  'רופא עיניים',
  'רופא עור',
  'רופא ילדים',
];

const DoctorVisits = () => {
  const route = useRoute();
  const { childId} = route.params;
  const [childData, setChildData] = useState(null);
  const [editingVisit, setEditingVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorVisits, setDoctorVisits] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // מצב לתמונה שנבחרה
  

  useEffect(() => {
    const fetchChildData = async () => {
      try {
      if (!childId) throw new Error("לא התקבל מזהה ילד");
      const childDocRef = doc(db, "childrens", childId);
      const childDocSnap = await getDoc(childDocRef);
      if (childDocSnap.exists()) {
        setChildData(childDocSnap.data());
        setDoctorVisits(childDocSnap.data().doctorVisits || []);} // שומרים על הסדר כפי שהוא 
      else {
        throw new Error("לא נמצא מסמך עבור הילד");}} 
      catch (err) {
        setError(err.message);} 
      finally {
        setLoading(false);}
    };
    fetchChildData();
  }, [childId]);


  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("he-IL").format(date);
  };

  const handleImagePress = (photoUrl) => {
    setSelectedImage(photoUrl); // הגדרת התמונה שנבחרה
    setModalVisible(true); // הצגת המודל
  };

  const findNextAvailableId = () => {
    // יצירת סט של כל ה-IDs המספריים הקיימים
    const usedIds = new Set(doctorVisits.map((visit) => visit.id));
  
    // חיפוש המספר הפנוי הראשון
    let newId = 1;
    while (usedIds.has(newId)) {
      newId++;
    }
  
    return newId; // מחזיר את ה-ID הפנוי הראשון
  };
  

  const handleDownloadImage = async (imageUrl) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("צריך הרשאה לשמירת תמונות");
        return;
      }
  
      // וודא שה-URL קיים
      if (!imageUrl) {
        alert("לא נמצאה תמונה להורדה");
        return;
      }
  
      // יצירת שם ייחודי לקובץ
      const filename = `image_${new Date().getTime()}.jpg`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      const downloadedFile = await FileSystem.downloadAsync(imageUrl, fileUri);
  
      if (downloadedFile.status === 200) {
        await MediaLibrary.createAssetAsync(downloadedFile.uri);
        setModalVisible(false);
        alert("התמונה נשמרה בהצלחה!");
      } else {
        setModalVisible(false);
        alert("שגיאה בהורדת התמונה.");
      }
    } catch (error) {
      console.error("שגיאה בהורדה:", error);
      setModalVisible(false);
      alert("שגיאה בהורדה.");
    }
  };

  const handleDeleteVisit = async (visitId) => {
    console.log(visitId)
    Alert.alert("אישור מחיקה", "האם אתה בטוח שברצונך למחוק את השלב?", [
      { text: "לא", style: "cancel" },
      {
        text: "כן",
        onPress: async () => {
          try {
            if (!childData?.doctorVisits) return;
  
            // מחפש את האינדקס של השלב למחיקה
            const visitIndex = childData.doctorVisits.findIndex(
              (visit) => visit.id === visitId
            );
  
            if (visitIndex === -1) {
              console.error("שלב לא נמצא");
              return;
            }

            // יצירת מערך מעודכן ללא השלב שנמחק
            const updatedDoctorVisits = [...childData.doctorVisits];
            updatedDoctorVisits.splice(visitIndex, 1); // מחיקה לפי אינדקס
  
            // עדכון בפיירבייס
            const childDocRef = doc(db, "childrens", childId);
            await updateDoc(childDocRef, { doctorVisits: updatedDoctorVisits });
  
            // עדכון הסטייט המקומי לאחר הצלחה
            setDoctorVisits(updatedDoctorVisits);
            setChildData((prevData) => ({
              ...prevData,
              doctorVisits: updatedDoctorVisits,
            }));
  
            setEditingVisit(null);
            Alert.alert("מחיקה הצליחה", "השלב נמחק בהצלחה!");
          } catch (err) {
            console.error("שגיאה במחיקת שלב:", err);
            Alert.alert("שגיאה", "אירעה שגיאה בעת מחיקת השלב.");
          }
        },
      },
    ]);
  };
  
  const VisitEditor = ({ visitName, visitData, isNewvisit}) => {
    const [localImage, setLocalImage] = useState(visitData?.photoUrl || null);
    const [localNewImage, setLocalNewImage] = useState(null);
    const [isEditingDoctorType, setIsEditingDoctorType] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editData, setEditData] = useState({
      date: visitData?.date ? new Date(visitData.date.seconds * 1000) : null,
      comments: visitData?.comments || "",
      customVisitName: isNewvisit ? "" : visitName,
      photo: visitData?.photo || "",
      doctorName: visitData?.doctorName || "",
      doctorType: visitData?.doctorType || "",
      location: visitData?.location || "",
      referrals: visitData?.referrals || "",
      medications: visitData?.medications || "",
      diagnosis: visitData?.diagnosis || "",
      id: isNewvisit ? findNextAvailableId() : visitData?.id
    });

  // Reset image and data when switching between visits
  useEffect(() => {
    setLocalImage(visitData?.photoUrl);
    setLocalNewImage(null);
    setEditData({
      date: visitData?.date ? new Date(visitData.date.seconds * 1000) : null,
      comments: visitData?.comments || "",
      customVisitName: isNewvisit ? "" : visitName,
      photo: visitData?.photo || "",
      doctorName: visitData?.doctorName || "",
      doctorType: visitData?.doctorType || "",
      location: visitData?.location || "",
      referrals: visitData?.referrals || "",
      medications: visitData?.medications || "",
      diagnosis: visitData?.diagnosis || "",
      id: isNewvisit ? findNextAvailableId() : visitData?.id

    });
  }, [visitName, visitData]);

  const handlePickImage = async () => {
    Alert.alert("הוסף תמונה", "בחר את מקור התמונה:", [
      {
        text: "📷 מצלמה",
        onPress: async () => {
          const photo = await pickImage(true); // צילום תמונה
          if (photo) setLocalNewImage(photo);
        },
      },
      {
        text: "🖼️ גלריה",
        onPress: async () => {
          const photo = await pickImage(false); // בחירת תמונה מהגלריה
          if (photo) setLocalNewImage(photo);
        },
      },
      { text: "ביטול", style: "cancel" },
    ]);
  };

  const handleDeleteImage = () => {
    Alert.alert("אישור מחיקה", "האם אתה בטוח שברצונך למחוק את התמונה?", [
      { text: "לא", style: "cancel" },
      {
        text: "כן",
        onPress: () => {
          setLocalImage(null);
          setLocalNewImage(null);
          Alert.alert("הצלחה", "התמונה נמחקה בהצלחה!");
        },
      },
    ]);
  };

  const handleSaveVisit = async () => {
    console.log(editData.id)
    console.log(findNextAvailableId())
    try {
      // בדיקות תקינות
      if (!editData.customVisitName && isNewvisit) {
        Alert.alert("שגיאה", "נא להזין סיבת הביקור");
        return;
      }
      
      const visitIndex = childData.doctorVisits.findIndex(
        (visit) => visit.name === visitName
      );
      console.log(visitIndex)

      setIsLoading(true);
      const childDocRef = doc(db, "childrens", childId);
      let photoUrl = visitData?.photoUrl || "";
  
      if (localNewImage) {
        try {
          photoUrl = await uploadImage(localNewImage, childData.idNumber, "doctorVisits");
        } catch (error) {
          Alert.alert("שגיאה", "שגיאה בהעלאת התמונה");
          return;
        }
      } else if (localImage === null && visitData?.photoUrl) {
        photoUrl = null;
      }
  
      const updatedVisitData = {
        date: editData.date ? Timestamp.fromDate(editData.date) : null,
        comments: editData.comments || "",
        name: editData.customVisitName,
        photoUrl: photoUrl,
        doctorName: editData.doctorName || "",
        doctorType: editData.doctorType || "",
        location: editData.location || "",
        referrals: editData.referrals || "",
        medications: editData.medications || "",
        diagnosis: editData.diagnosis || "",
        id: editData?.id

      };
  
      // מערך עדכני של אבני דרך
      let updatedDoctorVisits = [...(childData.doctorVisits || [])];
 
      if (isNewvisit) {
        // הוספת שלב חדש
        updatedDoctorVisits.push(updatedVisitData);
      } else {
        // עדכון שלב קיים
        console.log("save", visitIndex)
        updatedDoctorVisits[visitIndex] = updatedVisitData;
      }
  
      // מיון השלבים לפי תאריך (אופציונלי)
      updatedDoctorVisits.sort((a, b) => {
        if (!b.date) return 1;
        if (!a.date) return -1;
        return a.date.toDate() - b.date.toDate();
      });
  
      await updateDoc(childDocRef, { doctorVisits: updatedDoctorVisits });
  
      setChildData((prevData) => ({
        ...prevData,
        doctorVisits: updatedDoctorVisits,
      }));

      setDoctorVisits(updatedDoctorVisits);
      setEditingVisit(null);
      setLocalNewImage(null);
      setLocalImage(null);

      Alert.alert("הצלחה", "השלב נשמר בהצלחה!");
    } catch (error) {
      console.error("שגיאה בשמירת השלב:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בשמירת השלב");
    } finally {
      setIsLoading(false);
    }
  };
  
    //מחיקת התאריך שנבחר
    const handleResetDate = () => {
      setEditData((prev) => ({
        ...(prev || {}),
        date: null, // מאפס את התאריך
      }));
    };

    const handleDateChange = (event, selectedDate) => {
      setShowDatePicker(false);
      
      if (selectedDate) {
        const today = new Date();
        const birthDate = childData?.birthDate.toDate();
  
        if (selectedDate < birthDate) {
          Alert.alert("שגיאה", "התאריך לא יכול להיות לפני תאריך הלידה של הילד.");
          return;
        }
  
        if (selectedDate > today) {
          Alert.alert("שגיאה", "התאריך לא יכול להיות אחרי תאריך היום.");
          return;
        }
  
        setEditData(prevData => ({
          ...prevData,
          date: selectedDate
        }));
      }
    };

return (
  <View style={styles.visitContainer}>
    {/* שלב עריכה / תצוגה */}
    <Text style={styles.label}>סיבת הביקור</Text>
    <View style={styles.inputContainer}>
      <TextInput
        value={editData.customVisitName}
        onChangeText={(text) => setEditData({ ...editData, customVisitName: text })}
        style={styles.input}
        multiline
      />
    </View>

    {/* תאריך */}
    <View style={styles.section}>
      <Text style={styles.label}>תאריך</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.visitButton}>
        <Icon name="calendar" size={20} color="#fff" marginRight='4'/>
        <Text style={{color: "white", fontSize: 16}}>
          {editData.date ? formatDate(editData.date) : "בחר תאריך"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={editData.date || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            handleDateChange(event, selectedDate);
          }}
        />
      )}
    </View>

    {editData.date && (
      <TouchableOpacity onPress={handleResetDate}>
        <Text style={styles.brownButtonText}>מחק תאריך</Text>
      </TouchableOpacity>
    )}

    {/* שם הרופא*/}
    <Text style={styles.label}>שם הרופא</Text>
    <View style={styles.inputContainer}>
      <TextInput
        value={editData.doctorName}
        onChangeText={(text) => setEditData({ ...editData, doctorName: text })}
        style={styles.input}
        multiline
      />
    </View>


    {isEditingDoctorType ? (
      <View style={styles.section}>
        <Text style={styles.label}>סוג הרופא</Text>

        <Picker
          selectedValue={editData.doctorType}
          onValueChange={(itemValue) => {
            if (itemValue === "אחר") {
              setIsEditingDoctorType(true);
              setEditData((prev) => ({ ...prev, doctorType: "" }));
            } else {
              setIsEditingDoctorType(false);
              setEditData((prev) => ({ ...prev, doctorType: itemValue }));
            }
          }}
          style={styles.picker}
        >
          {DoctorTypeOptions.map((visit) => (
            <Picker.Item key={visit} label={visit} value={visit} />
          ))}
          <Picker.Item label="אחר" value="אחר" />
        </Picker>

        {isEditingDoctorType && (
          <TextInput
            value={editData.doctorType}
            onChangeText={(text) => setEditData({ ...editData, doctorType: text })}
            style={styles.input}
            placeholder="הזן שם שלב"
            onBlur={() => setIsEditingDoctorType(false)} // ברגע שהמשתמש יוצא מהשדה, השם יתעדכן
          />
        )}
      </View>
    ) : (
      <View style={styles.section}>
        <Text style={styles.label}>סוג הרופא</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.visitNameText}>{editData.doctorType}</Text>
          <TouchableOpacity onPress={() => setIsEditingDoctorType(true)}>
            <Icon name="edit" size={20} color="#6A0572" />
          </TouchableOpacity>
        </View>
      </View>
    )}

    {/* מיקום*/}
    <Text style={styles.label}>מיקום</Text>
    <View style={styles.inputContainer}>
      <TextInput
        value={editData.location}
        onChangeText={(text) => setEditData({ ...editData, location: text })}
        style={styles.input}
        multiline
      />
    </View>

    {/* אבחנה*/}
    <Text style={styles.label}>אבחנה</Text>
    <View style={styles.inputContainer}>
      <TextInput
        value={editData.diagnosis}
        onChangeText={(text) => setEditData({ ...editData, diagnosis: text })}
        style={styles.input}
        multiline
      />
    </View>

    {/* הפניות*/}
    <Text style={styles.label}>הפניות</Text>
    <View style={styles.inputContainer}>
      <TextInput
        value={editData.referrals}
        onChangeText={(text) => setEditData({ ...editData, referrals: text })}
        style={styles.input}
        multiline
      />
    </View>

    {/* תרופות */}
    <Text style={styles.label}>תרופות/דרך טיפול</Text>
    <View style={styles.inputContainer}>
      <TextInput
        value={editData.medications}
        onChangeText={(text) => setEditData({ ...editData, medications: text })}
        style={styles.input}
        multiline
      />
    </View>

    {/* הערות */}
    <Text style={styles.label}>הערות</Text>
    <View style={styles.inputContainer}>
      <TextInput
        value={editData.comments}
        onChangeText={(text) => setEditData({ ...editData, comments: text })}
        style={styles.input}
        multiline
      />
    </View>

    {/* בחר תמונה */}
    <TouchableOpacity style={styles.visitButton} onPress={handlePickImage}>
    <MaterialCommunityIcons name="file-document" size={24} color="white" />
    <Text style={{color: "white", fontSize: 16}}>בחר מסמך </Text>
    </TouchableOpacity>

    {/* הצגת התמונה */}
    {localNewImage && <Image source={{ uri: localNewImage.uri }} style={styles.preview} />}
    {localImage && !localNewImage && <Image source={{ uri: localImage }} style={styles.preview} />}

    {/* מחיקת תמונה */}
    {(localImage || localNewImage) && (
      <TouchableOpacity onPress={handleDeleteImage}>
        <Text style={styles.brownButtonText}>מחק תמונה</Text>
      </TouchableOpacity>
    )}

    {/* כפתורים לשמירה / ביטול / מחיקה */}
    <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={handleSaveVisit} style={styles.saveButton} disabled={!editData.customVisitName}>
        {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
        ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
          <Text style={[styles.visitButtonText, { marginLeft: 5 }]}>שמור</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setEditingVisit(null)} style={styles.cencelButton}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="block-helper" size={20}  color="#fff" />
          <Text style={[styles.visitButtonText, { marginLeft: 5 }]}>ביטול</Text>
        </View>
      </TouchableOpacity>

      {!isNewvisit && (
        <TouchableOpacity onPress={() => handleDeleteVisit(editData.id)} style={styles.deleteButton}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="trash" size={20} color="#fff" />
            <Text style={[styles.visitButtonText, { marginLeft: 5 }]}>מחק שלב</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  </View>
);};

if (loading) return <View><Text>טוען נתונים...</Text></View>;
if (error) return <View><Text>שגיאה: {error}</Text></View>;

  return (
    <ImageBackground 
      source={require("../../assets/background2.jpg")} 
      style={styles.background}
    >
      <View style={styles.container}>
        <Header />
  
        {/* <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, marginTop: 10 }} keyboardShouldPersistTaps="handled"> */}
                    <Text style={styles.header}>הביקורים של {childData?.name} אצל הרופא </Text>
  
          {/* רשימת הביקורים ללא אפשרות גרירה */}
          <FlatList
            data={doctorVisits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return (
                <View key={item.id} style={styles.visitItem}>
                  <Text style={styles.visitTitle}>{item.name}</Text>
  
                  {editingVisit === item.id ? (
                    <VisitEditor visitName={item.name} visitData={item} />
                  ) : (
                    <View>
                      {item.age && <Text style={{ color: "#555", fontSize: 15 }}>גיל ביצוע הבדיקה: {item.age}</Text>}
                      {item.date && <Text style={{ color: "#555", fontSize: 15 }}>תאריך: {formatDate(item.date)}</Text>}
                      {item.doctorName && <Text style={{ color: "#555", fontSize: 15 }}>שם הרופא: {item.doctorName}</Text>}
                      {item.doctorType && <Text style={{ color: "#555", fontSize: 15 }}>סוג הרופא: {item.doctorType}</Text>}
                      {item.location && <Text style={{ color: "#555", fontSize: 15 }}>מיקום: {item.location}</Text>}
                      {item.diagnosis && <Text style={{ color: "#555", fontSize: 15 }}>אבחנה: {item.diagnosis}</Text>}
                      {item.referrals && <Text style={{ color: "#555", fontSize: 15 }}>הפניות: {item.referrals}</Text>}
                      {item.medications && <Text style={{ color: "#555", fontSize: 15 }}>תרופות/טיפול אחר: {item.medications}</Text>}

                      {item.comments ? <Text style={{ color: "#555", fontSize: 15 }}>הערות: {item.comments}</Text> : null}
                      
                      <Modal visible={modalVisible} transparent={true} animationType="fade">
                        <View style={styles.modalContainer}>
                          <TouchableOpacity 
                            onPress={() => setModalVisible(false)} 
                            style={styles.closeButton}
                          >
                            <Text style={{ color: 'white', fontSize: 30 }}>✕</Text>
                          </TouchableOpacity>
  
                          {selectedImage && (
                            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                          )}
  
                          <TouchableOpacity 
                            onPress={() => handleDownloadImage(selectedImage)} 
                            style={styles.downloadButton}
                          >
                            <Text style={{ fontWeight: "bold", fontSize: 16 }}>הורד תמונה</Text>
                          </TouchableOpacity>
                        </View>
                      </Modal>
  
                      {item.photoUrl && (
                        <TouchableOpacity onPress={() => handleImagePress(item.photoUrl)}>
                          <Image source={{ uri: item.photoUrl }} style={styles.preview} />
                        </TouchableOpacity>
                      )}
  
                      {/* כפתור עריכה לשלב */}
                      <TouchableOpacity 
                        onPress={() => setEditingVisit(item.id)} 
                        style={styles.editButton}
                      >
                        <Text style={styles.brownButtonText}>ערוך</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
          />
  
          <TouchableOpacity 
            onPress={() => setEditingVisit("newvisit")} 
            style={styles.outButton}
          >
            <Text style={styles.buttonText}>הוסף ביקור חדש</Text>
          </TouchableOpacity>
  
          {/* הצגת השדות לעריכה במרכז אם נמצאים במצב עריכה */}
          {editingVisit === "newvisit" && (
            <View style={styles.editingVisitContainer}>
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">

              <VisitEditor 
                visitName="newvisit" 
                visitData={{date: null, doctorName: "", doctorType: "", location: "", diagnosis: "", referrals: "", medications: "", comments: "", photo: "" }} 
                isNewvisit={true} 
              />
                </ScrollView>

            </View>
          )}
        {/* </ScrollView>
        </KeyboardAvoidingView> */}

      </View>
    </ImageBackground>
  );
};  

export default DoctorVisits;


const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    resizeMode: "cover", 
    width: "100%", 
    height: "100%", 
},
container: { 
  padding: 16, 
  flex: 1, 
  borderRadius: 20, 
  margin: 10 
},
header: {
  fontSize: 26,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 16,
  color: 'rgba(134, 59, 24, 0.91)',
  textShadowColor: 'rgba(160, 143, 143, 0.5)', // צבע הצל
  textShadowOffset: { width: 2, height: 2 }, // מיקום הצל (הזזה אופקית ואנכית)
  textShadowRadius: 4, // רדיוס הצל (גודל התפשטות)
},

  visitItem: {
    backgroundColor:"rgb(250, 246, 246)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%", // פריסה על כל הרוחב
    alignSelf: "stretch", // מוודא התאמה מלאה
  },
  visitTitle: {
    textAlign: "right",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color:'rgb(91, 9, 97)'
  },
  editButton: {
    marginTop: 6,
    alignSelf: "flex-end",
  },
  outButton: {
    backgroundColor:'rgb(91, 9, 97)',
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
    // alignSelf: "center"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "85%",
    height: "100%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  downloadButton: {
    marginTop: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    bottom: 50,
  },
  editingVisitContainer: {
    flex: 1,
    position: "absolute",
    backgroundColor: "rgb(226, 216, 225)",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
    height: "80%", // התאמת גובה למסך, כך שלא תחתך
    top: "10%", // נותן מרווח למעלה
  },
  brownButtonText: {
    color: 'rgba(134, 59, 24, 0.91)',
  },

  section:{
    width: "100%", 
    marginTop: 12
  },
  label: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color:'rgb(91, 9, 97)',
    textAlign: "right",
    marginBottom: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,

  },
  visitButtonText: {
    color: "white",
    fontSize: 14,
    // fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
  },
  cencelButton: {
    backgroundColor: "#9E9E9E",
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor:'rgb(91, 9, 97)',
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
  },
  visitButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor:'rgb(145, 109, 144)', 
    padding: 10, 
    borderRadius: 16, 
    justifyContent: "center", 
    marginBottom: 8 
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderWidth: 1, 
    borderRadius: 16, 
    backgroundColor: "#fff", 
    marginBottom: 10,
    color: "#fff",
  },
  input: { 
    flex: 1, 
    marginLeft: 8 ,
  },

});
