// import React, { useState, useEffect } from "react";
// import {View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ImageBackground, ScrollView} from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs} from "firebase/firestore";
// import { db} from '../../util/firebaseConfig';
// import Icon from "react-native-vector-icons/FontAwesome";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { uploadImage, pickImage, deleteImage, moveAllFiles} from '../../components/ImageUpload';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import Header from '../../components/header'; // ייבוא הקומפוננטה של הסרגל

// const Vacinations = () => {
//   const route = useRoute();
//   const { childId} = route.params;
//   const [childData, setChildData] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [vacinations, setVacinations] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editingStage, setEditingStage] = useState(null);

//    useEffect(() => {
//      const fetchChildData = async () => {
//        try {
//        if (!childId) throw new Error("לא התקבל מזהה ילד");
//        const childDocRef = doc(db, "childrens", childId);
//        const childDocSnap = await getDoc(childDocRef);
//        if (childDocSnap.exists()) {
//          setChildData(childDocSnap.data());
//          setVacinations(childDocSnap.data().vacinations || []);} // שומרים על הסדר כפי שהוא 
//        else {
//          throw new Error("לא נמצא מסמך עבור הילד");}} 
//        catch (err) {
//          setError(err.message);} 
//        finally {
//          setLoading(false);}
//      };
//      fetchChildData();
//    }, [childId]);

// const StageEditor = ({ stageName, stageData, isNewStage}) => {
//     const [localImage, setLocalImage] = useState(stageData?.photoUrl || null);
//     const [localNewImage, setLocalNewImage] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [showDatePicker, setShowDatePicker] = useState(false);
//     const [editData, setEditData] = useState({
//       name: stageData?.name,
//       age: stageData?.age,
//       estimatedDate: stageData?.estimatedDate? new Date(stageData.date.seconds * 1000) : null,
//       date: stageData?.date ? new Date(stageData.date.seconds * 1000) : null,
//       place: stageData?.place,
//       // comments: stageData?.comments || "",
//       // customStageName: isNewStage ? "" : stageName,
//       // photo: stageData?.photo || "",
//     });

//   // Reset image and data when switching between stages
//   useEffect(() => {
//     // setLocalImage(stageData?.photoUrl);
//     // setLocalNewImage(null);
//     setEditData({
//       name: stageData?.name,
//       age: stageData?.age,
//       estimatedDate: stageData?.estimatedDate? new Date(stageData.date.seconds * 1000) : null,
//       date: stageData?.date ? new Date(stageData.date.seconds * 1000) : null,
//       place: stageData?.place,
//     });
//   }, [stageName, stageData]);

//   // const handlePickImage = async () => {
//   //   Alert.alert("הוסף תמונה", "בחר את מקור התמונה:", [
//   //     {
//   //       text: "📷 מצלמה",
//   //       onPress: async () => {
//   //         const photo = await pickImage(true); // צילום תמונה
//   //         if (photo) setLocalNewImage(photo);
//   //       },
//   //     },
//   //     {
//   //       text: "🖼️ גלריה",
//   //       onPress: async () => {
//   //         const photo = await pickImage(false); // בחירת תמונה מהגלריה
//   //         if (photo) setLocalNewImage(photo);
//   //       },
//   //     },
//   //     { text: "ביטול", style: "cancel" },
//   //   ]);
//   // };

//   // const handleDeleteImage = () => {
//   //   Alert.alert("אישור מחיקה", "האם אתה בטוח שברצונך למחוק את התמונה?", [
//   //     { text: "לא", style: "cancel" },
//   //     {
//   //       text: "כן",
//   //       onPress: () => {
//   //         setLocalImage(null);
//   //         setLocalNewImage(null);
//   //         Alert.alert("הצלחה", "התמונה נמחקה בהצלחה!");
//   //       },
//   //     },
//   //   ]);
//   // };

//   const handleSaveStage = async () => {
//     try {
//       // בדיקות תקינות
//       if (!editData.customStageName && isNewStage) {
//         Alert.alert("שגיאה", "נא להזין שם שלב");
//         return;
//       }
  
//       const stageExists = childData?.mileStones?.some(
//         (s) => s.name === editData.customStageName
//       );

//       if (editData.customStageName!== stageName && stageExists) {
//         Alert.alert("שגיאה", "שם השלב כבר קיים");
//         return;
//       }
      
//       const stageIndex = childData.mileStones.findIndex(
//         (stage) => stage.name === stageName
//       );
//       console.log(stageIndex)

//       setIsLoading(true);
//       const childDocRef = doc(db, "childrens", childId);
//       let photoUrl = stageData?.photoUrl || "";
  
//       if (localNewImage) {
//         try {
//           photoUrl = await uploadImage(localNewImage, childData.idNumber, "mileStones");
//         } catch (error) {
//           Alert.alert("שגיאה", "שגיאה בהעלאת התמונה");
//           return;
//         }
//       } else if (localImage === null && stageData?.photoUrl) {
//         photoUrl = null;
//       }
  
//       const updatedStageData = {
//         date: editData.date ? Timestamp.fromDate(editData.date) : null,
//         comments: editData.comments || "",
//         name: editData.customStageName,
//         photoUrl: photoUrl,
//       };
  
//       // מערך עדכני של אבני דרך
//       let updatedMileStones = [...(childData.mileStones || [])];
 
//       if (isNewStage) {
//         // הוספת שלב חדש
//         updatedMileStones.push(updatedStageData);
//       } else {
//         // עדכון שלב קיים
//         console.log("save", stageIndex)
//         updatedMileStones[stageIndex] = updatedStageData;
//       }
  
//       // מיון השלבים לפי תאריך (אופציונלי)
//       updatedMileStones.sort((a, b) => {
//         if (!a.date) return 1;
//         if (!b.date) return -1;
//         return b.date.toDate() - a.date.toDate();
//       });
  
//       await updateDoc(childDocRef, { mileStones: updatedMileStones });
  
//       setChildData((prevData) => ({
//         ...prevData,
//         mileStones: updatedMileStones,
//       }));

//       setMileStones(updatedMileStones);
//       setEditingStage(null);
//       setLocalNewImage(null);
//       setLocalImage(null);

//       Alert.alert("הצלחה", "השלב נשמר בהצלחה!");
//     } catch (error) {
//       console.error("שגיאה בשמירת השלב:", error);
//       Alert.alert("שגיאה", "אירעה שגיאה בשמירת השלב");
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//     //מחיקת התאריך שנבחר
//     const handleResetDate = () => {
//       setEditData((prev) => ({
//         ...(prev || {}),
//         date: null, // מאפס את התאריך
//       }));
//     };

//     const handleDateChange = (event, selectedDate) => {
//       setShowDatePicker(false);
      
//       if (selectedDate) {
//         const today = new Date();
//         const birthDate = childData?.birthDate.toDate();
  
//         if (selectedDate < birthDate) {
//           Alert.alert("שגיאה", "התאריך לא יכול להיות לפני תאריך הלידה של הילד.");
//           return;
//         }
  
//         if (selectedDate > today) {
//           Alert.alert("שגיאה", "התאריך לא יכול להיות אחרי תאריך היום.");
//           return;
//         }
  
//         setEditData(prevData => ({
//           ...prevData,
//           date: selectedDate
//         }));
//       }
//     };
//     return (
//       <View style={styles.stageContainer}>
//         {/* שלב עריכה / תצוגה */}

//           <View style={styles.section}>
//             <Text style={styles.label}>שם החיסון</Text>
//             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//               <Text style={styles.stageNameText}>{editData.name}</Text>
//             </View>
//           </View>
        
    
//         {/* תאריך */}
//         <View style={styles.section}>
//           <Text style={styles.label}>תאריך</Text>
//           <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.stageButton}>
//             <Icon name="calendar" size={20} color="#fff" marginRight='4'/>
//             <Text style={{color: "white", fontSize: 16}}>
//               {editData.date ? formatDate(editData.date) : "בחר תאריך"}
//             </Text>
//           </TouchableOpacity>
//           {showDatePicker && (
//             <DateTimePicker
//               value={editData.date || new Date()}
//               mode="date"
//               display="default"
//               onChange={(event, selectedDate) => {
//                 handleDateChange(event, selectedDate);
//               }}
//             />
//           )}
//         </View>
    
//         {editData.date && (
//           <TouchableOpacity onPress={handleResetDate}>
//             <Text style={styles.brownButtonText}>מחק תאריך</Text>
//           </TouchableOpacity>
//         )}
    
//         {/* הערות */}
//         <Text style={styles.label}>הערות</Text>
//         <View style={styles.inputContainer}>
//           <TextInput
//             value={editData.comments}
//             onChangeText={(text) => setEditData({ ...editData, comments: text })}
//             style={styles.input}
//             multiline
//           />
//         </View>
    
//         {/* בחר תמונה */}
//         <TouchableOpacity style={styles.stageButton} onPress={handlePickImage}>
//           <Icon name="camera" size={20} color="#fff" />
//           <Text style={{color: "white", fontSize: 16}}>בחר תמונה </Text>
//         </TouchableOpacity>
    
//         {/* הצגת התמונה */}
//         {localNewImage && <Image source={{ uri: localNewImage.uri }} style={styles.preview} />}
//         {localImage && !localNewImage && <Image source={{ uri: localImage }} style={styles.preview} />}
    
//         {/* מחיקת תמונה */}
//         {(localImage || localNewImage) && (
//           <TouchableOpacity onPress={handleDeleteImage}>
//             <Text style={styles.brownButtonText}>מחק תמונה</Text>
//           </TouchableOpacity>
//         )}
    
//         {/* כפתורים לשמירה / ביטול / מחיקה */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity onPress={handleSaveStage} style={styles.saveButton} disabled={!editData.customStageName}>
//             {isLoading ? (
//             <ActivityIndicator size="small" color="#fff" />
//             ) : (
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
//               <Text style={[styles.stageButtonText, { marginLeft: 5 }]}>שמור</Text>
//               </View>
//             )}
//           </TouchableOpacity>
    
//           <TouchableOpacity onPress={() => setEditingStage(null)} style={styles.cencelButton}>
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <MaterialCommunityIcons name="block-helper" size={20}  color="#fff" />
//               <Text style={[styles.stageButtonText, { marginLeft: 5 }]}>ביטול</Text>
//             </View>
//           </TouchableOpacity>
    
//           {!isNewStage && (
//             <TouchableOpacity onPress={() => handleDeleteStage(stageName)} style={styles.deleteButton}>
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <Icon name="trash" size={20} color="#fff" />
//                 <Text style={[styles.stageButtonText, { marginLeft: 5 }]}>מחק שלב</Text>
//               </View>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     );};

 
//   if (!childData) {
//     return <Text>טוען נתוני ילד...</Text>;
//   }


//   return (
//     <ImageBackground 
//       source={require("../../assets/background2.jpg")} 
//       style={styles.background}
//     >
//       <View style={styles.container}>
//         <Header />
  
//         <ScrollView style={{ flex: 1, marginTop: 10 }}>
//           <Text style={styles.header}>החיסונים של {childData?.name}</Text>
  
  
//           {/* רשימת השלבים עם אפשרות גרירה רק במצב עריכה */}
//           <View
//             data={vacinations}
//             keyExtractor={(item) => item.name}
//             onDragEnd={handleDragEnd}
//             renderItem={({ item, drag, isActive }) => {
//               return (
//                 <View
//                   key={item.name}
//                   style={[styles.stageItem, isActive]}
//                 >
//                   <Text style={styles.stageTitle}>{item.name}</Text>
  
//                   {editingStage === item.name ? (
//                     <StageEditor stageName={item.name} stageData={item} />
//                   ) : (
//                     <View >
//                       {item.date && <Text style={{color: "#555", fontSize:15}}>תאריך: {formatDate(item.ExecutionDate)}</Text>}
//                       {/* {item.comments && <Text style={{color: "#555", fontSize:15}}>הערות: {item.comments}</Text>} */}
                      
//                       {/* <Modal visible={modalVisible} transparent={true} animationType="fade">
//                         <View style={styles.modalContainer}>
//                           <TouchableOpacity 
//                             onPress={() => setModalVisible(false)} 
//                             style={styles.closeButton}
//                           >
//                             <Text style={{color: 'white', fontSize: 30}}>✕</Text>
//                           </TouchableOpacity>

//                           {selectedImage && (
//                             <Image source={{ uri: selectedImage }} style={styles.fullImage} />
//                           )}

//                           <TouchableOpacity 
//                             onPress={() => handleDownloadImage(selectedImage)} 
//                             style={styles.downloadButton}
//                           >
//                             <Text style={{fontWeight: "bold", fontSize: 16}}>הורד תמונה</Text>
//                           </TouchableOpacity>
//                         </View>
//                       </Modal> */}

//                       {/* {item.photoUrl && (<TouchableOpacity onPress={() => handleImagePress(item.photoUrl)}>
//                         <Image source={{ uri: item.photoUrl }} style={styles.preview} />
//                       </TouchableOpacity>)} */}
  
//                       {/* כפתור עריכה לשלב */}
//                       <TouchableOpacity 
//                         onPress={() => setEditingStage(item.name)} 
//                         style={styles.editButton}
//                       >
//                         <Text style={styles.brownButtonText}>ערוך</Text>
//                       </TouchableOpacity>
  
//                     </View>
//                   )}
//                 </View>
//               );
//             }}
//           />
  
//         </ScrollView>
//       </View>
//     </ImageBackground>
//   );  };


// export default Vacinations;
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, TextInput, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute } from "@react-navigation/native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../util/firebaseConfig";

const Vacinations = () => {
  const route = useRoute();
  const { childId } = route.params;
  const [childData, setChildData] = useState(null);
  const [vacinations, setVacinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVacinations, setExpandedVacinations] = useState({});
  const [expandedParts, setExpandedParts] = useState({});
  const [editingPart, setEditingPart] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        if (!childId) throw new Error("לא התקבל מזהה ילד");
        const childDocRef = doc(db, "childrens", childId);
        const childDocSnap = await getDoc(childDocRef);
        if (childDocSnap.exists()) {
          const data = childDocSnap.data();
          setChildData(data);
          setVacinations(data.vacinations || []);
        } else {
          throw new Error("לא נמצא מסמך עבור הילד");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChildData();
  }, [childId]);

  const toggleVacination = (vacinationName) => {
    setExpandedVacinations((prev) => ({
      ...prev,
      [vacinationName]: !prev[vacinationName],
    }));
  };

  const togglePart = (vacinationName, partIndex) => {
    setExpandedParts((prev) => ({
      ...prev,
      [`${vacinationName}-${partIndex}`]: !prev[`${vacinationName}-${partIndex}`],
    }));
  };

  const handleEditPart = (vacinationName, partIndex) => {
    setEditingPart(`${vacinationName}-${partIndex}`);
  };

  const handleSavePart = async (vacinationName, partIndex) => {
    try {
      const updatedVacinations = [...vacinations];
      updatedVacinations
        .find((vac) => vac.name === vacinationName)
        .parts[partIndex].executionDate = selectedDate.toISOString();

      setVacinations(updatedVacinations);
      setEditingPart(null);

      const childDocRef = doc(db, "childrens", childId);
      await updateDoc(childDocRef, { vacinations: updatedVacinations });

    } catch (err) {
      console.error("שגיאה בשמירה", err);
    }
  };

  const calculateRecommendedDate = (birthDate, monthsToAdd) => {
    const birth = new Date(birthDate);
    birth.setMonth(birth.getMonth() + monthsToAdd);
    return birth.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={{ color: "red" }}>{error}</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>חיסונים</Text>
      {vacinations.length === 0 ? (
        <Text>לא נמצאו חיסונים</Text>
      ) : (
        <FlatList
          data={vacinations}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={{ marginVertical: 10, borderBottomWidth: 1, paddingBottom: 10 }}>
              <TouchableOpacity onPress={() => toggleVacination(item.name)}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "blue" }}>
                  {item.name} {expandedVacinations[item.name] ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {expandedVacinations[item.name] &&
                item.parts.map((part, index) => (
                  <View key={index} style={{ marginLeft: 20, marginVertical: 5 }}>
                    <TouchableOpacity onPress={() => togglePart(item.name, index)}>
                      <Text style={{ fontSize: 16, color: "darkblue" }}>
                        {part.title} {expandedParts[`${item.name}-${index}`] ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>

                    {expandedParts[`${item.name}-${index}`] && (
                      <View>
                        <Text style={{ fontSize: 14, color: "gray", marginTop: 5 }}>
                          {part.details}
                        </Text>
                        <Text style={{ fontSize: 14, marginTop: 5 }}>
                          תאריך מומלץ: {calculateRecommendedDate(childData.birthDate, part.recommendedAge)}
                        </Text>

                        {editingPart === `${item.name}-${index}` ? (
                          <View>
                            <Text>תאריך ביצוע:</Text>
                            <DateTimePicker
                              value={selectedDate}
                              mode="date"
                              display="default"
                              onChange={(event, date) => date && setSelectedDate(date)}
                            />
                            <Button title="שמירה" onPress={() => handleSavePart(item.name, index)} />
                          </View>
                        ) : (
                          <View>
                            <Text>תאריך ביצוע: {part.executionDate || "לא הוזן"}</Text>
                            <TouchableOpacity onPress={() => handleEditPart(item.name, index)}>
                              <Text style={{ color: "green" }}>עריכה</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Vacinations;
