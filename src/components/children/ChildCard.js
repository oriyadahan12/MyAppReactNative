import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utilitis/firebaseConfig';
import { useParams, useNavigate} from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

const ChildCard = () => {
  const { childId, personalUsername} = useParams();
  const [childData, setChildData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const childDocRef = doc(db, 'childrens', childId);
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          setChildData(childDocSnap.data());
        } else {
          console.error('לא נמצא ילד עם ה-ID הזה');
        }
      } catch (error) {
        console.error('שגיאה בעת שליפת נתוני הילד:', error);
      }
    };

    fetchChildData();
  }, [childId]);

  if (!childData) {
    return <div>טוען פרטי ילד...</div>;
  }

  const calculateAge = (birthTimestamp) => {
    const birthDate = birthTimestamp.toDate();
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    if (days < 0) {
      months--;
    }
  
    return { years, months };
  };

  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('he-IL');
    }
    return new Date(timestamp).toLocaleDateString('he-IL');
  };

  const age = calculateAge(childData.birthDate);

  return (
    <div>
      <h1>פרטי הילד</h1>
      <p>שם: {childData.name}</p>
      <p>תעודת זהות: {childData.idNumber}</p>
      <p>תאריך לידה: {formatDate(childData.birthDate)}</p>
      <p>גיל: {age.years === 0 
        ? `${age.months} חודשים` 
        : `${age.years} שנים ו-${age.months} חודשים`}</p>

      <div>
        <button onClick={() => navigate(`/children/GrowthStages/${childData.idNumber}`)}>
          התפתחות הילד
        </button>
        <button onClick={() => navigate(`/children/DoctorVisits/${childData.idNumber}`)}>
          ביקורים אצל הרופא
        </button>
        <button onClick={() => navigate(`/children/Vaccinations/${childData.idNumber}`)}>
          חיסונים
        </button>
        <button onClick={() => navigate(`/children/GrowthSize/${childData.idNumber}`)}>
          מעקב גדילה
        </button>
        <button onClick={() => navigate(`/children/UpdateChild/${childData.idNumber}/${personalUsername}`)}>
          עדכון פרטי הילד
        </button>
      </div>
    </div>
  );
};

export default ChildCard;