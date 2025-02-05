import { View, Text, ImageBackground, TouchableOpacity, TextInput, Alert, Image, ScrollView, ActivityIndicator, Modal, StyleSheet, Platform } from "react-native";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, Timestamp , deleteField} from "firebase/firestore";
import { db} from "../../util/firebaseConfig";
import {useNavigation ,  useRoute} from '@react-navigation/native'; // שינינו ל-RN Navigation
import DateTimePicker from "@react-native-community/datetimepicker";
import { uploadImage, pickImage, deleteImage} from '../../components/ImageUpload';
import Icon from "react-native-vector-icons/FontAwesome";
import Header from '../../components/header'; // ייבוא הקומפוננטה של הסרגל
import { Picker } from '@react-native-picker/picker';
import DraggableFlatList from "react-native-draggable-flatlist";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const growthStageOptions = [
  'הרמתי את הראש בפעם הראשונה',
  'התהפכתי מהבטן לגב',
  'התהפכתי מהגב לבטן',
  'החזקתי צעצוע לבד',
  'אכלתי אוכל אמיתי',
  'התחלת זחילת ציר',
  'ישבתי לבד',
  'עמדתי לבד',
  'נופפתי לשלום',
  'אכלתי לבד',
  'מחאתי כפיים',
  'הלכתי בעזרת חפץ',
  'הפסקתי לשתות חלב'
];

const MileStones = () => {
  const route = useRoute();
  const { childId} = route.params;
  const [childData, setChildData] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mileStones, setMileStones] = useState(null);
  const [editMode, setEditMode] = useState(false);
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
        setMileStones(childDocSnap.data().mileStones || []);} // שומרים על הסדר כפי שהוא 
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

  const handleDragEnd = async ({ data }) => {
    setMileStones(data);
  
    try {
      const childDocRef = doc(db, "childrens", childId);
      await updateDoc(childDocRef, { mileStones: data });
    } catch (err) {
      console.error("שגיאה בעדכון השלבים:", err);
    }
  };

  const handleDownloadImage = async (item) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("צריך הרשאה לשמירת תמונות");
        return;
      }
  
      const fileUri = FileSystem.documentDirectory + item.name + ".jpg";
      const downloadedFile = await FileSystem.downloadAsync(item.photoUrl, fileUri);
  
      if (downloadedFile.status === 200) {
        await MediaLibrary.createAssetAsync(downloadedFile.uri);
        setModalVisible(false)
        alert("התמונה נשמרה בהצלחה!");
      } else {
        setModalVisible(false)
        alert("שגיאה בהורדת התמונה.");
      }
    } catch (error) {
      console.error("שגיאה בהורדה:", error);
      setModalVisible(false)
      alert("שגיאה בהורדה.");
    }
  };

  const handleDeleteStage = async (stageName) => {
    Alert.alert("אישור מחיקה", "האם אתה בטוח שברצונך למחוק את השלב?", [
      { text: "לא", style: "cancel" },
      {
        text: "כן",
        onPress: async () => {
          try {
            if (!childData?.mileStones) return;
  
            // מחפש את האינדקס של השלב למחיקה
            const stageIndex = childData.mileStones.findIndex(
              (stage) => stage.name === stageName
            );
  
            if (stageIndex === -1) {
              console.error("שלב לא נמצא");
              return;
            }

            // יצירת מערך מעודכן ללא השלב שנמחק
            const updatedMileStones = [...childData.mileStones];
            updatedMileStones.splice(stageIndex, 1); // מחיקה לפי אינדקס
  
            // עדכון בפיירבייס
            const childDocRef = doc(db, "childrens", childId);
            await updateDoc(childDocRef, { mileStones: updatedMileStones });
  
            // עדכון הסטייט המקומי לאחר הצלחה
            setMileStones(updatedMileStones);
            setChildData((prevData) => ({
              ...prevData,
              mileStones: updatedMileStones,
            }));
  
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
  
  const StageEditor = ({ stageName, stageData, isNewStage}) => {
    const [localImage, setLocalImage] = useState(stageData?.photoUrl || null);
    const [localNewImage, setLocalNewImage] = useState(null);
    const [isEditingStageName, setIsEditingStageName] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editData, setEditData] = useState({
      date: stageData?.date ? new Date(stageData.date.seconds * 1000) : null,
      comments: stageData?.comments || "",
      customStageName: isNewStage ? "" : stageName,
      photo: stageData?.photo || "",
    });

  // Reset image and data when switching between stages
  useEffect(() => {
    setLocalImage(stageData?.photoUrl);
    setLocalNewImage(null);
    setEditData({
      date: stageData?.date ? new Date(stageData.date.seconds * 1000) : null,
      comments: stageData?.comments || "",
      customStageName: isNewStage ? "" : stageName,
      photo: stageData?.photo || "",
    });
  }, [stageName, stageData]);

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

  const handleSaveStage = async () => {
    try {
      // בדיקות תקינות
      if (!editData.customStageName && isNewStage) {
        Alert.alert("שגיאה", "נא להזין שם שלב");
        return;
      }
  
      const stageExists = childData?.mileStones?.some(
        (s) => s.name === editData.customStageName
      );

      if (editData.customStageName!== stageName && stageExists) {
        Alert.alert("שגיאה", "שם השלב כבר קיים");
        return;
      }
      
      const stageIndex = childData.mileStones.findIndex(
        (stage) => stage.name === stageName
      );
      console.log(stageIndex)

      setIsLoading(true);
      const childDocRef = doc(db, "childrens", childId);
      let photoUrl = stageData?.photoUrl || "";
  
      if (localNewImage) {
        try {
          photoUrl = await uploadImage(localNewImage, childData.idNumber, "mileStones");
        } catch (error) {
          Alert.alert("שגיאה", "שגיאה בהעלאת התמונה");
          return;
        }
      } else if (localImage === null && stageData?.photoUrl) {
        photoUrl = null;
      }
  
      const updatedStageData = {
        date: editData.date ? Timestamp.fromDate(editData.date) : null,
        comments: editData.comments || "",
        name: editData.customStageName,
        photoUrl: photoUrl,
      };
  
      // מערך עדכני של אבני דרך
      let updatedMileStones = [...(childData.mileStones || [])];
 
      if (isNewStage) {
        // הוספת שלב חדש
        updatedMileStones.push(updatedStageData);
      } else {
        // עדכון שלב קיים
        console.log("save", stageIndex)
        updatedMileStones[stageIndex] = updatedStageData;
      }
  
      // מיון השלבים לפי תאריך (אופציונלי)
      updatedMileStones.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.toDate() - a.date.toDate();
      });
  
      await updateDoc(childDocRef, { mileStones: updatedMileStones });
  
      setChildData((prevData) => ({
        ...prevData,
        mileStones: updatedMileStones,
      }));

      setMileStones(updatedMileStones);
      setEditingStage(null);
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
  <View style={styles.stageContainer}>
    {/* שלב עריכה / תצוגה */}
    {(isNewStage || isEditingStageName) ? (
      <View style={styles.section}>
        <Text style={styles.label}>שם השלב</Text>

        <Picker
          selectedValue={editData.customStageName}
          onValueChange={(itemValue) => {
            if (itemValue === "אחר") {
              setIsEditingStageName(true);
              setEditData((prev) => ({ ...prev, customStageName: "" }));
            } else {
              setIsEditingStageName(false);
              setEditData((prev) => ({ ...prev, customStageName: itemValue }));
            }
          }}
          style={styles.picker}
        >
          {growthStageOptions.map((stage) => (
            <Picker.Item key={stage} label={stage} value={stage} />
          ))}
          <Picker.Item label="אחר..." value="אחר" />
        </Picker>

        {isEditingStageName && (
          <TextInput
            value={editData.customStageName}
            onChangeText={(text) => setEditData({ ...editData, customStageName: text })}
            style={styles.input}
            placeholder="הזן שם שלב"
            onBlur={() => setIsEditingStageName(false)} // ברגע שהמשתמש יוצא מהשדה, השם יתעדכן
          />
        )}
      </View>
    ) : (
      <View style={styles.section}>
        <Text style={styles.label}>שם השלב</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.stageNameText}>{editData.customStageName || stageName}</Text>
          <TouchableOpacity onPress={() => setIsEditingStageName(true)}>
            <Icon name="edit" size={20} color="#6A0572" />
          </TouchableOpacity>
        </View>
      </View>
    )}

    {/* תאריך */}
    <View style={styles.section}>
      <Text style={styles.label}>תאריך</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.stageButton}>
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
    <TouchableOpacity style={styles.stageButton} onPress={handlePickImage}>
      <Icon name="camera" size={20} color="#fff" />
      <Text style={{color: "white", fontSize: 16}}>בחר תמונה </Text>
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
      <TouchableOpacity onPress={handleSaveStage} style={styles.saveButton} disabled={!editData.customStageName}>
        {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
        ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
          <Text style={[styles.stageButtonText, { marginLeft: 5 }]}>שמור</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setEditingStage(null)} style={styles.cencelButton}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="block-helper" size={20}  color="#fff" />
          <Text style={[styles.stageButtonText, { marginLeft: 5 }]}>ביטול</Text>
        </View>
      </TouchableOpacity>

      {!isNewStage && (
        <TouchableOpacity onPress={() => handleDeleteStage(stageName)} style={styles.deleteButton}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="trash" size={20} color="#fff" />
            <Text style={[styles.stageButtonText, { marginLeft: 5 }]}>מחק שלב</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  </View>
);};

  if (loading) return <View>טוען נתונים...</View>;
  if (error) return <View>שגיאה: {error}</View>;
  

  return (
    <ImageBackground 
      source={require("../../assets/background2.jpg")} 
      style={styles.background}
    >
      <View style={styles.container}>
        <Header />
  
        <ScrollView style={{ flex: 1, marginTop: 10 }}>
          <Text style={styles.header}>ציוני הדרך של {childData?.name}</Text>
  
          {/* כפתור שמפעיל את מצב העריכה */}
          <TouchableOpacity 
            onPress={() => setEditMode(!editMode)} 
            style={styles.outButton}
          >
            <Text style={styles.buttonText}>
              {editMode ? "סיים עריכה" : "ערוך סדר שלבים"}
            </Text>
          </TouchableOpacity>
  
          {/* רשימת השלבים עם אפשרות גרירה רק במצב עריכה */}
          <DraggableFlatList
            data={mileStones}
            keyExtractor={(item) => item.name}
            onDragEnd={handleDragEnd}
            renderItem={({ item, drag, isActive }) => {
              return (
                <View
                  key={item.name}
                  style={[styles.stageItem, isActive]}
                >
                  <Text style={styles.stageTitle}>{item.name}</Text>
  
                  {editingStage === item.name ? (
                    <StageEditor stageName={item.name} stageData={item} />
                  ) : (
                    <View >
                      {item.date && <Text style={{color: "#555", fontSize:15}}>תאריך: {formatDate(item.date)}</Text>}
                      {item.comments && <Text style={{color: "#555", fontSize:15}}>הערות: {item.comments}</Text>}
                      
                      <Modal visible={modalVisible} transparent={true} animationType="fade">
                        <View style={styles.modalContainer}>
                          <TouchableOpacity 
                            onPress={() => setModalVisible(false)} 
                            style={styles.closeButton}
                          >
                            <Text style={{color: 'white', fontSize: 30}}>✕</Text>
                          </TouchableOpacity>

                          {selectedImage && (
                            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                          )}

                          <TouchableOpacity 
                            onPress={() => handleDownloadImage(selectedImage)} 
                            style={styles.downloadButton}
                          >
                            <Text style={{fontWeight: "bold", fontSize: 16}}>הורד תמונה</Text>
                          </TouchableOpacity>
                        </View>
                      </Modal>

                      {item.photoUrl && (<TouchableOpacity onPress={() => handleImagePress(item.photoUrl)}>
                        <Image source={{ uri: item.photoUrl }} style={styles.preview} />
                      </TouchableOpacity>)}
  
                      {/* כפתור עריכה לשלב */}
                      <TouchableOpacity 
                        onPress={() => setEditingStage(item.name)} 
                        style={styles.editButton}
                      >
                        <Text style={styles.brownButtonText}>ערוך</Text>
                      </TouchableOpacity>
  
                      {/* כפתור גרירה - מופיע רק כאשר editMode === true */}
                      {editMode && (
                        <TouchableOpacity onPressIn={drag} style={{alignSelf: "flex-end"}}>
                          <Text style={{fontSize: 25, color: "#555",}}>≡</Text> 
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            }}
          />

          <TouchableOpacity 
            onPress={() => setEditingStage("newStage")} 
            style={styles.outButton}
          >
            <Text style={styles.buttonText}>הוסף שלב חדש</Text>
          </TouchableOpacity>
  
          {/* הצגת השדות לעריכה במרכז אם נמצאים במצב עריכה */}
          {editingStage === "newStage" && (
            <View style={styles.editingStageContainer}>
              <StageEditor 
                stageName="newStage" 
                stageData={{ date: "", comments: "", photo: "" }} 
                isNewStage={true} 
              />
            </View>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );  };
export default MileStones;

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

  stageItem: {
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
  stageTitle: {
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
  editingStageContainer: {
    flex: 1,
    position: "absolute", // הופך את המיכל למרצף על פני כל המסך
    backgroundColor:'rgb(226, 216, 225)', 
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%", // פריסה על כל הרוחב
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
  stageButtonText: {
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
  stageButton: { 
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
