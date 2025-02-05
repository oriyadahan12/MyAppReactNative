import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type DoctorVisit = {
    date: Date | null;          // תאריך הביקור
    doctorName: string;         // שם הרופא
    location: string;           // מיקום
    reason: string;             // סיבת הביקור
    referrals: string;          // הפניות
    medications: string;        // תרופות או טיפול
    notes: string;              // הערות
    documents: string[];        // קישורים למסמכים/תמונות
  };
  
const DoctorVisits = () => {
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [newVisit, setNewVisit] = useState<DoctorVisit>({
    date: null,
    doctorName: '',
    location: '',
    reason: '',
    referrals: '',
    medications: '',
    notes: '',
    documents: [],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddVisit = () => {
    setVisits([...visits, newVisit]);
    setNewVisit({
      date: null,
      doctorName: '',
      location: '',
      reason: '',
      referrals: '',
      medications: '',
      notes: '',
      documents: [],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>ביקורי רופא</Text>

      {/* טופס להוספת ביקור */}
      <Button title="בחר תאריך" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={newVisit.date || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            setNewVisit((prev) => ({ ...prev, date: selectedDate || prev.date }));
          }}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="שם הרופא"
        value={newVisit.doctorName}
        onChangeText={(text) => setNewVisit((prev) => ({ ...prev, doctorName: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="מיקום"
        value={newVisit.location}
        onChangeText={(text) => setNewVisit((prev) => ({ ...prev, location: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="סיבת ביקור"
        value={newVisit.reason}
        onChangeText={(text) => setNewVisit((prev) => ({ ...prev, reason: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="הפניות"
        value={newVisit.referrals}
        onChangeText={(text) => setNewVisit((prev) => ({ ...prev, referrals: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="תרופות/טיפול"
        value={newVisit.medications}
        onChangeText={(text) => setNewVisit((prev) => ({ ...prev, medications: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="הערות"
        value={newVisit.notes}
        onChangeText={(text) => setNewVisit((prev) => ({ ...prev, notes: text }))}
        multiline
      />
      {/* העלאת מסמכים/תמונות - להוסיף פונקציית pickImage */}
      <Button title="הוסף ביקור" onPress={handleAddVisit} />

      {/* הצגת הביקורים */}
      {visits.map((visit, index) => (
        <View key={index} style={styles.visitContainer}>
          <Text>תאריך: {visit.date?.toLocaleDateString()}</Text>
          <Text>שם הרופא: {visit.doctorName}</Text>
          <Text>מיקום: {visit.location}</Text>
          <Text>סיבה: {visit.reason}</Text>
          <Text>הערות: {visit.notes}</Text>
          {/* כפתורים לעריכה/מחיקה */}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, padding: 8, marginBottom: 8, borderRadius: 4 },
  visitContainer: { padding: 8, marginVertical: 4, borderWidth: 1, borderRadius: 4 },
});

export default DoctorVisits;
