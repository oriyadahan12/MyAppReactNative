import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, Timestamp , deleteField} from "firebase/firestore";
import { db } from "../../utilitis/firebaseConfig";
import { useParams } from "react-router-dom";

const stageTranslations = {
  firstSmile: "החיוך הראשון שלי",
  headUp: "הרמתי את הראש בפעם הראשונה",
  RollOverFromStomach: "התהפכתי מהבטן לגב",
  RollOverFromBack: "התהפכתי מהגב לבטן",
  laughter: "צחקתי",
  toyHolding: "החזקתי צעצוע לבד",
  food: "אכלתי אוכל אמיתי",
  axisCrawl: "התחלתי זחילת ציר",
  crawl: "זחלתי",
  sitting: "ישבתי לבד",
  firstTooth: "צמחה לי שן ראשונה",
  standAlone: "עמדתי לבד",
  hello: "נופפתי לשלום",
  eatAlone: "אכלתי לבד",
  clapHands: "מחאתי כפים",
  walk: "הלכתי בעזרת חפץ",
  walkAlone: "הלכתי לבד",
  firstWord: "המילה הראשונה שלי",
  stopMilk: "הפסקתי לשתות חלב",
  WeaningDiapers: "נגמלתי מטיטולים",
};

const GrowthStages = () => {
  const { childId } = useParams();
  const [childData, setChildData] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        if (!childId) throw new Error("לא התקבל מזהה ילד");
        const childDocRef = doc(db, "childrens", childId);
        const childDocSnap = await getDoc(childDocRef);
        if (childDocSnap.exists()) {
          setChildData(childDocSnap.data());
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

  const validateDates = (firstDate, lastDate) => {
    const first = new Date(firstDate);
    const last = new Date(lastDate);
    const birth = childData.birthDate.toDate();
    const today = new Date();

    if (first < birth || last < birth) {
      return "תאריך לא תקין: אחד התאריכים קודם לתאריך הלידה";
    }
    if (first > today || last > today) {
      return "תאריך לא תקין: אחד התאריכים בעתיד";
    }
    if (first > last) {
      return "תאריך סיום קודם לתאריך התחלה";
    }
    return null;
  };

  
  const handleSaveStage = async (stageName, stageData) => {
    const errorMsg = validateDates(stageData.firstDate, stageData.lastDate);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    try {
      const updatedData = {
        ...stageData,
        firstDate: stageData.firstDate ? Timestamp.fromDate(new Date(stageData.firstDate)) : null,
        lastDate: stageData.lastDate ? Timestamp.fromDate(new Date(stageData.lastDate)) : null,
      };

      const childDocRef = doc(db, "childrens", childId);
      await updateDoc(childDocRef, {
        [`growthStages.${stageName}`]: updatedData,
      });

      setChildData((prevData) => ({
        ...prevData,
        growthStages: {
          ...prevData.growthStages,
          [stageName]: updatedData,
        },
      }));
      setEditingStage(null);
    } catch (err) {
      console.error("שגיאה בעדכון שלב:", err);
    }
  };

  const handleDeleteStage = async (stageName) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את השלב "${stageTranslations[stageName] || stageName}"?`)) {
      return;
    }
  
    try {
      const childDocRef = doc(db, "childrens", childId);
      await updateDoc(childDocRef, {
        [`growthStages.${stageName}`]: deleteField(),
      });
  
      setChildData((prevData) => {
        const updatedGrowthStages = { ...prevData.growthStages };
        delete updatedGrowthStages[stageName];
        return { ...prevData, growthStages: updatedGrowthStages };
      });
  
      setEditingStage(null);
    } catch (err) {
      console.error("שגיאה במחיקת שלב:", err);
      alert("אירעה שגיאה בעת מחיקת השלב.");
    }
  };
  

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("he-IL").format(date);
  };
  

  const StageEditor = ({ stageName, stageData, isNewStage }) => {
    const [editData, setEditData] = useState({
      firstDate: formatDate(stageData?.firstDate),
      lastDate: formatDate(stageData?.lastDate),
      comments: stageData?.comments || "",
      customStageName: isNewStage ? "" : stageName,
    });
  
    return (
      <div className="p-4 space-y-4">
        {isNewStage && (
          <div>
            <label className="block text-sm font-medium mb-1">שם השלב</label>
            <input
              type="text"
              value={editData.customStageName}
              onChange={(e) => setEditData({ ...editData, customStageName: e.target.value })}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
  
        <div>
          <label className="block text-sm font-medium mb-1">תאריך התחלה</label>
          <input
            type="date"
            value={editData.firstDate}
            onChange={(e) => setEditData({ ...editData, firstDate: e.target.value })}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dir="ltr"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">תאריך סיום</label>
          <input
            type="date"
            value={editData.lastDate}
            onChange={(e) => setEditData({ ...editData, lastDate: e.target.value })}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dir="ltr"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">הערות</label>
          <textarea
            value={editData.comments}
            onChange={(e) => setEditData({ ...editData, comments: e.target.value })}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
          />
        </div>
  
        <div className="flex gap-2">
          <button
            onClick={() => handleSaveStage(editData.customStageName || stageName, editData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            שמור
          </button>
          <button
            onClick={() => setEditingStage(null)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ביטול
          </button>
          <button
            onClick={() => handleDeleteStage(stageName)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            מחק שלב
          </button>
        </div>

        </div>
    );
  };
  

  if (loading) return <div>טוען נתונים...</div>;
  if (error) return <div>שגיאה: {error}</div>;

  return (
    <div>
      <h1>מעקב התפתחות - {childData?.name}</h1>
      <div dir="rtl">
  {Object.entries(childData.growthStages || {})
    .sort(([a], [b]) => {
      const keys = Object.keys(stageTranslations);
      return keys.indexOf(a) - keys.indexOf(b);
    })
    .map(([stageName, stageData]) => (
      <div key={stageName}>
        <h3>{stageTranslations[stageName] || stageName}</h3>
        {editingStage === stageName ? (
          <StageEditor stageName={stageName} stageData={stageData} />
        ) : (
          <div>
            {stageData.firstDate || stageData.lastDate || stageData.comments ? (
              <>
                {stageData.firstDate && stageData.lastDate && (
                  <p>
                    טווח תאריכים: {formatDate(stageData.firstDate)} - {formatDate(stageData.lastDate)}
                  </p>
                )}
                <p>הערות: {stageData.comments || ""}</p>
              </>
            ) : null}
            <button onClick={() => setEditingStage(stageName)}>ערוך</button>
          </div>
        )}
      </div>
    ))}
</div>


<button
  onClick={() => setEditingStage("newStage")}
  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mt-4"
>
  הוסף שלב חדש
</button>

{editingStage === "newStage" && (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <StageEditor
      stageName="newStage"
      stageData={{ firstDate: "", lastDate: "", comments: "" }}
      isNewStage={true}
    />
  </div>
)}

    </div>
  );
};

export default GrowthStages;
