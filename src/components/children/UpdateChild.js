import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../../utilitis/firebaseConfig";

const UpdateChild = () => {
  const { childId, personalUsername } = useParams();
  const [childData, setChildData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const childDocRef = doc(db, "childrens", childId);
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          const data = childDocSnap.data();
          setChildData({
            ...data,
            birthDate: new Date(data.birthDate.seconds * 1000)
              .toISOString()
              .split("T")[0],
          });
        } else {
          console.error("לא נמצא מסמך עבור הילד עם ID:", childId);
        }
      } catch (error) {
        console.error("שגיאה בשליפת נתוני הילד:", error);
      }
    };

    fetchChildData();
  }, [childId]);

  const handleUpdateChild = async () => {
    try {
      const childDocRef = doc(db, "childrens", childId);
      const previousName = childData.name;

      // עדכון פרטי הילד במסמך הילדים
      await setDoc(childDocRef, {
        ...childData,
        birthDate: new Date(childData.birthDate),
      });

      // עדכון במסמך המשפחה
      const familyDocRef = doc(db, "families", childData.familyID);
      const familySnapshot = await getDoc(familyDocRef);

      if (!familySnapshot.exists()) {
        alert("משפחה זו לא קיימת במערכת.");
        return;
      }

      if (previousName !== childData.name) {
        await updateDoc(familyDocRef, {
          [`children.${previousName}`]: deleteField(),
          [`children.${childData.name}`]: childData.idNumber
        });
      }

      alert("פרטי הילד עודכנו בהצלחה!");
      navigate(`/childcard/${childId}/${personalUsername}`);
    } catch (error) {
      console.error("שגיאה בעדכון פרטי הילד:", error);
      alert("שגיאה בעדכון פרטי הילד");
    }
  };

  const handleDeleteChild = async () => {
    const confirmDelete = window.confirm(
      "האם אתה בטוח שברצונך למחוק את פרטי הילד? פעולה זו אינה ניתנת לביטול."
    );
    if (confirmDelete) {
      try {
        const childDocRef = doc(db, "childrens", childId);
        await deleteDoc(childDocRef);

        const familyDocRef = doc(db, "families", childData.familyID);
        await updateDoc(familyDocRef, {
          [`children.${childData.name}`]: deleteField()
        });

        alert("הילד נמחק בהצלחה!");
        navigate(`/family/${childData.familyID}/${personalUsername}`);
      } catch (error) {
        console.error("שגיאה במחיקת פרטי הילד:", error);
        alert("שגיאה במחיקת הילד");
      }
    }
  };

  if (!childData) {
    return <div>טוען נתוני ילד...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">עדכון פרטי הילד</h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="שם הילד"
          value={childData.name}
          onChange={(e) => setChildData({ ...childData, name: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          value={childData.birthDate}
          onChange={(e) => setChildData({ ...childData, birthDate: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <select
          value={childData.gender}
          onChange={(e) => setChildData({ ...childData, gender: e.target.value })}
          className="w-full p-2 border rounded"
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
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-4">
          <button
            onClick={handleUpdateChild}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            עדכן פרטים
          </button>
          <button
            onClick={handleDeleteChild}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            מחק ילד
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateChild;