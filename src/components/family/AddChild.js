import React, { useState } from "react";
import { doc, updateDoc, setDoc, getDoc, Timestamp} from "firebase/firestore";
import { db } from '../../utilitis/firebaseConfig';
import { useParams } from 'react-router-dom';

const AddChild = () => {
  const { familyUsername } = useParams();

  const [childData, setChildData] = useState({
    name: "",
    birthDate: "",
    gender: "",
    photo: null,
    idNumber: "", // קטגוריה של תעודת זהות
  });

  const validateBirthDate = (date) => {
    const birth = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return birth < today && age < 21;
  };

  const handleAddChild = async () => {
    if (!childData.name || !childData.birthDate || !childData.gender || !childData.idNumber) {
      alert("יש למלא את כל השדות החובה!");
      return;
    }

    if (!validateBirthDate(childData.birthDate)) {
      alert("תאריך הלידה לא תקין או גדול מדי (ניתן להוסיף ילד עד גיל 20)");
      return;
    }

    try {
      // בדיקה אם תעודת הזהות כבר קיימת
      const existingChildDoc = await getDoc(doc(db, "childrens", childData.idNumber));
      if (existingChildDoc.exists()) {
        alert("תעודת הזהות הזו כבר קיימת במערכת. אנא בדקו שנית.");
        return;
      }

      // עדכון באוסף המשפחה - רק שם ותעודת זהות
      const familyDoc = doc(db, 'families', familyUsername);
      const familySnapshot = await getDoc(familyDoc);

      if (!familySnapshot.exists()) {
        alert("משפחה זו לא קיימת במערכת.");
        return;
      }

      await updateDoc(familyDoc, {
        [`children.${childData.name}`]: childData.idNumber,
      });

      // יצירת מסמך נפרד עבור הילד
      const childDoc = doc(db, "childrens", childData.idNumber);
      await setDoc(childDoc, {
        name: childData.name,
        birthDate: Timestamp.fromDate(new Date(childData.birthDate)),
        gender: childData.gender,
        photo: childData.photo || null,
        idNumber: childData.idNumber, // מזהה ייחודי
        familyID:familyUsername,
        growthStages: {
          firstSmile: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          headUp: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          RollOverFromStomach: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          RollOverFromBack: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          laughter: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          toyHolding: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          food: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          axisCrawl: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          crawl: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          sitting: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          firstTooth: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          standAlone: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          hello: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },          
          eatAlone: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          clapHands: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          walk: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          walkAlone: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          stopMilk: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          firstWord: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
          WeaningDiapers: {
            firstDate: null, // תאריך התחלתי ריק
            lastDate: null, // תאריך התחלתי ריק
            comments: "", // מחרוזת ריקה
            document: null, // מסמך או תמונה ריק
          },
        },
      });

      alert("הילד נוסף בהצלחה!");
      setChildData({ name: "", birthDate: "", gender: "", photo: null, idNumber: "" });
    } catch (error) {
      console.error("שגיאה בהוספת הילד: ", error);
      alert("אירעה שגיאה במהלך הוספת הילד. נסי שוב מאוחר יותר.");
    }
  };

  return (
    <div>
      <h2>{familyUsername}</h2>
      <input
        type="text"
        placeholder="שם הילד"
        value={childData.name}
        onChange={(e) => setChildData({ ...childData, name: e.target.value })}
      />
      <input
        type="date"
        value={childData.birthDate}
        onChange={(e) => setChildData({  ...childData, birthDate: e.target.value })}
      />
      <select
        value={childData.gender}
        onChange={(e) => setChildData({ ...childData,  gender: e.target.value })}
      >
        <option value="">בחר מין</option>
        <option value="זכר">זכר</option>
        <option value="נקבה">נקבה</option>
      </select>
      <input
        type="text"
        placeholder="תעודת זהות"
        value={childData.idNumber}
        onChange={(e) => setChildData({ ...childData, idNumber: e.target.value })}
      />
      <button onClick={handleAddChild}>הוסף ילד</button>
    </div>
  );
};

export default AddChild;
