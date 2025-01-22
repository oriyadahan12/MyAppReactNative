import AddChild from "./AddChild";
import ChildCard from "../children/ChildCard";
import UpdatePersonalDetails from "./UpdatePersonalDetails";
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utilitis/firebaseConfig'; // קובץ ה־Firebase שלך
import { getDatabase, ref, get } from "firebase/database";

const FamilyPage = () => {
  const { familyUsername, personalUsername } = useParams(); // קבלת הפרמטרים מהנתיב
  const [familyData, setFamilyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [children, setChildren] = useState({}); // שינוי לאובייקט

  const navigate = useNavigate();

  useEffect(() => {
    // שליפת פרטי המשפחה מ-Firestore
    const fetchFamilyData = async () => {
      try {
        const familyDocRef = doc(db, 'families', familyUsername); // מסמך המשפחה
        const familyDocSnap = await getDoc(familyDocRef);

        if (familyDocSnap.exists()) {
          setFamilyData(familyDocSnap.data());

          const childrenData = familyDocSnap.data().children || {};
          // שליפת הילדים מתוך Firebase אם יש
          if (childrenData) {
            setChildren(childrenData);
          }
        } else {
          console.error('מסמך המשפחה לא נמצא');
        }
      } catch (error) {
        console.error('שגיאה בעת שליפת פרטי המשפחה:', error);
      }
    };

    // שליפת פרטי המשתמש מ-Firestore
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', personalUsername); // מסמך המשתמש
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.error('מסמך המשתמש לא נמצא');
        }
      } catch (error) {
        console.error('שגיאה בעת שליפת פרטי המשתמש:', error);
      }
    };

    // קריאה לפונקציות
    fetchFamilyData();
    fetchUserData();
  }, [familyUsername, personalUsername]);

  if (!familyData || !userData) {
    return <div>טוען...</div>; // הודעת טעינה בזמן שליפת המידע
  }
  
  
  return (
    <div>
      <h1>שלום {userData.firstName}</h1>
      <h1>ברוכים הבאים למשפחת {familyData.familyName}</h1>
      {'איזה פעולות תהיו מעוניינים לבצע?'}
  


      {/* אם יש ילדים במשפחה, ניצור כפתורים לכל אחד מהם */}
      {children && Object.keys(children).length > 0 && (
      <div>
        <h2>ילדי המשפחה:</h2>
        {Object.entries(children).map(([childName, childID]) => (
          <button
            key={childID} // משתמשים ב-ID של הילד כ-key
            onClick={() => navigate(`/ChildCard/${childID}/${personalUsername}`)} // מבוצע ניווט לפי ה-ID
          >
            {childName} {/* הצגת שם הילד */}
          </button>
        ))}
      </div>
    )}
            {/* כפתור להוספת ילד */}
            <button onClick={() => navigate(`/AddChild/${familyUsername}`)}> הוספת ילד למשפחה</button>
    </div>
  );
};

export default FamilyPage;
