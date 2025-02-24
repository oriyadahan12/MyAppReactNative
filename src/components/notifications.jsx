import { db } from "../../util/firebaseConfig";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

const sendNotificationToFamilyOwner = async (familyId, newUserName) => {
    try {
        // מחפש את המשפחה כדי לזהות את המשתמש הבעלים
        const familiesRef = collection(db, "families");
        const q = query(familiesRef, where("id", "==", familyId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const familyData = querySnapshot.docs[0].data();
            const ownerId = familyData.ownerId;

            // שולח התראה לבעלים
            await addDoc(collection(db, "notifications"), {
                userId: ownerId,
                message: `${newUserName} הצטרף למשפחה שלך!`,
                timestamp: new Date()
            });
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

export default sendNotificationToFamilyOwner;
