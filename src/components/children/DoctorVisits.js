import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utilitis/firebaseConfig";

const DoctorVisits = () => {
  const { childId } = useParams(); // מקבל את ה-ID מהנתיב
  const [childData, setChildData] = useState(null);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const childDocRef = doc(db, "childrens", childId); // גישה למסמך הילד
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          setChildData(childDocSnap.data());
        } else {
          console.error("לא נמצא מסמך עבור הילד עם ID:", childId);
        }
      } catch (error) {
        console.error("שגיאה בשליפת נתוני הילד:", error);
      }
    };

    fetchChildData();
  }, [childId]);

  if (!childData) {
    return <div>טוען נתוני ילד...</div>;
  }

  return (
    <div>
      <h1>ביקורים אצל הרופא</h1>
      <p>שם: {childData.name}</p>
    </div>
  );
};

export default DoctorVisits;
