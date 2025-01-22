import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, 
         signInWithPopup, 
         GoogleAuthProvider, 
         FacebookAuthProvider } from 'firebase/auth';
import { auth } from '../../utilitis/firebaseConfig';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
// import './style.css';
import './LoginPage.css';


const db = getFirestore();

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // state להצגת הסיסמה
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // קבלת המסמך מתוך אוסף 'users' לפי שם משתמש
      const querySnapshot = await getDocs(query(collection(db, 'users'), where('personalUsername', '==', username)));
  
      // בדיקת קיום מסמך מתאים
      if (querySnapshot.empty) {
        alert('שם משתמש לא קיים');
        return;
      }
  
      // מסמך המשתמש הראשון שנמצא
      const userDoc = querySnapshot.docs[0];
      const realPassword = userDoc.data().password;
      const familyUsername = userDoc.data().familyUsername; // שליפת פרטי המשפחה

      // בדיקת סיסמה
      if (realPassword !== password) {
        alert('סיסמה שגויה, נסה שנית');
        return;
      }


      // מעבר לדף הפתיחה
      navigate(`/family/${familyUsername}/${username}`); // נתיב דינמי לפי פרטי משפחה
    } catch (error) {
      console.error('שגיאה בעת כניסה: ', error);
    }
  };
  
  const handleSocialLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // בדוק אם המייל כבר קיים ב-users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const existingUserDoc = usersSnapshot.docs.find(
        (doc) => doc.data().email === user.email
      );
  
      if (existingUserDoc) {
        const existingUser = existingUserDoc.data();
        const familyUsername = existingUser.familyUsername; // קבלת שם המשתמש של המשפחה
        const personalUsername = existingUserDoc.id; // ID המשתמש הוא personalUsername
  
        alert('המייל הזה כבר רשום במערכת, נכנסים לחשבונך...');
        navigate(`/family/${familyUsername}/${personalUsername}`); // ניווט לנתיב הדינמי
        return;
      }
  
      // משתמש חדש - בחירה בין משפחה קיימת או חדשה
      const action = prompt('בחר אופציה:\n1 - להצטרף למשפחה קיימת\n2 - ליצור משפחה חדשה');
  
      if (action === '1') {
        const familyUsername = prompt('הכנס שם משתמש של המשפחה:');
        const password = prompt('הכנס סיסמה של המשפחה:');
  
        const familyDoc = await getDoc(doc(db, 'families', familyUsername));
        if (!familyDoc.exists()) {
          alert('משפחה לא נמצאה.');
          return;
        }
  
        const familyData = familyDoc.data();
        if (familyData.password !== password) {
          alert('סיסמה שגויה.');
          return;
        }
  
        // הוספת המשתמש למשפחה הקיימת
        await updateDoc(doc(db, 'families', familyUsername), {
          [`members.${user.uid}`]: {
            displayName: user.displayName || 'משתמש ללא שם',
            email: user.email,
          },
        });
  
        // יצירת מסמך משתמש ב-users
        await setDoc(doc(db, 'users', user.uid), {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          email: user.email,
          familyUsername,
          joinDate: new Date().toISOString(),
        });
  
        alert('הצטרפת בהצלחה למשפחה הקיימת!');
        navigate(`/family/${familyUsername}/${user.uid}`); // נתיב דינמי לפי פרטי משפחה
      } else if (action === '2') {
        const familyUsername = prompt('בחר שם משתמש למשפחה החדשה:');
        const familyName = prompt('הכנס שם משפחה:');
        const password = prompt(
          'בחר סיסמה (לפחות 6 תווים, לפחות אות אחת באנגלית או בעברית וספרה אחת):'
        );
  
        const familyDoc = await getDoc(doc(db, 'families', familyUsername));
        if (familyDoc.exists()) {
          alert('שם המשתמש כבר תפוס. אנא בחר שם משתמש אחר.');
          return;
        }
  
        const passwordRegex = /^(?=.*[A-Za-zא-ת])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
          alert('סיסמה לא תקינה.');
          return;
        }
  
        // יצירת משפחה חדשה
        await setDoc(doc(db, 'families', familyUsername), {
          familyName,
          password,
          children: {},
          members: {
            [user.uid]: {
              displayName: user.displayName || 'משתמש ללא שם',
              email: user.email,
            },
          },
        });
  
        // יצירת מסמך משתמש ב-users
        await setDoc(doc(db, 'users', user.uid), {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          email: user.email,
          familyUsername,
          joinDate: new Date().toISOString(),
        });
  
        alert('משפחה חדשה נוצרה בהצלחה!');
        navigate(`/family/${familyUsername}/${user.uid}`); // נתיב דינמי לפי פרטי משפחה
      } else {
        alert('בחירה לא תקינה');
      }
    } catch (error) {
      console.error('שגיאה בכניסה: ', error);
    }
  };
  


  return (
    <div className="container">
      <h2>כניסה</h2>
      <div className="input-group">
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="שם משתמש"
        />
        <div className="password-input-container">
          <input 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="סיסמה"
          />
          <button 
            className="show-password-btn" 
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            {showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
          </button>
        </div>
      </div>
      
      <div className="buttons-container">
        <div className="primary-buttons">
          <button onClick={handleLogin}>התחבר</button>
          <button onClick={() => navigate('/register')}>רישום</button>
        </div>
        <div className="social-buttons">
          <button onClick={() => handleSocialLogin(new GoogleAuthProvider())}>
            <svg className="social-button-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
             התחבר עם  
          </button>
          <button onClick={() => handleSocialLogin(new FacebookAuthProvider())}>
            <svg className="social-button-icon" viewBox="0 0 24 24">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
             התחבר עם 
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;