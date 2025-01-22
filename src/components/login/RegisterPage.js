import React, { useState } from 'react';
import { getFirestore, doc, setDoc, getDoc, Timestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './style.css';
import './RegisterPage.css';
// import 'bootstrap/dist/css/bootstrap.min.css';


const db = getFirestore();

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [familyUsername, setFamilyUsername] = useState('');
  const [personalUsername, setPersonalUsername] = useState('');
  const [joiningExistingFamily, setJoiningExistingFamily] = useState(false);
  const [familyPassword, setFamilyPassword] = useState('');
  const navigate = useNavigate();

  // Enhanced email validation (English characters only)
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Enhanced password validation (Unicode letters from any language + digits)
  const validatePassword = (password) => {
    // At least 6 characters long
    // Contains at least one letter from any language and one number
    const passwordRegex = /^(?=.*\p{L})(?=.*\d)[^\s]{6,}$/u;
    return passwordRegex.test(password);
  };

  // Check if all required fields are filled
  const validateAllFields = () => {
    return (
      firstName.trim() !== '' &&
      familyName.trim() !== '' &&
      birthDate.trim() !== '' &&
      gender.trim() !== '' &&
      email.trim() !== '' &&
      password.trim() !== '' &&
      familyUsername.trim() !== '' &&
      personalUsername.trim() !== ''
    );
  };

  const handleRegister = async () => {
    if (!validateAllFields()) {
      alert('אנא מלא את כל השדות הנדרשים.');
      return;
    }
  
    if (!validateBirthDate(birthDate)) {
      alert('עליך להיות מעל גיל 18 ותאריך הלידה חייב להיות תקין.');
      return;
    }
  
    if (!validateEmail(email)) {
      alert('כתובת האימייל אינה תקינה. אנא הזן כתובת אימייל תקינה באותיות אנגלית.');
      return;
    }
  
    if (!validatePassword(password)) {
      alert('הסיסמה צריכה להכיל לפחות 6 תווים, אות אחת וספרה אחת.');
      return;
    }
  
    try {
      const userDoc = await getDoc(doc(db, 'users', personalUsername));
      if (userDoc.exists()) {
        alert('שם המשתמש כבר תפוס. אנא בחר שם משתמש אחר.');
        return;
      }
  
      const emailQuery = query(collection(db, 'users'), where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        alert('כתובת הדואר האלקטרוני כבר קיימת במערכת. אנא בחר כתובת אחרת.');
        return;
      }
  
      let familyRef;
      if (joiningExistingFamily) {
        const familyDoc = await getDoc(doc(db, 'families', familyUsername));
        if (!familyDoc.exists()) {
          alert('שם משתמש משפחתי לא קיים.');
          return;
        }
        if (familyDoc.data().password !== familyPassword) {
          alert('סיסמת המשפחה שגויה.');
          return;
        }
        familyRef = doc(db, 'families', familyUsername);
      } else {
        // יצירת משפחה חדשה
        const familyDoc = await getDoc(doc(db, 'families', familyUsername));
        if (familyDoc.exists()) {
          alert('שם משתמש משפחתי כבר תפוס.');
          return;
        }
        familyRef = doc(db, 'families', familyUsername);
  
        // יצירת מסמך משפחה חדש עם שדה children כ-map ריק
        await setDoc(familyRef, { 
          familyUsername,
          password,
          familyName,
          children: {}, // יצירת map ריק בשם children
        });
      }
  
      await setDoc(doc(db, 'users', personalUsername), {
        personalUsername,
        password,
        firstName,
        familyName,
        birthDate: Timestamp.fromDate(new Date(birthDate)),
        gender,
        email,
        familyUsername,
        joinedAt: Timestamp.fromDate(new Date()),
      });
  
      await setDoc(
        familyRef,
        { 
          [`members.${personalUsername}`]: { personalUsername },
        },
        { merge: true }
      );
  
      alert('הרשמה הושלמה בהצלחה!');
      navigate(`/family/${familyUsername}/${personalUsername}`);
    } catch (error) {
      console.error('שגיאה בהרשמה: ', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('כתובת הדואר האלקטרוני כבר בשימוש.');
      } else {
        alert('אירעה שגיאה במהלך הרישום. נסה שוב.');
      }
    }
  };
  

  const validateBirthDate = (date) => {
    const birth = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return age >= 18 && birth < today;
  };

  return (
    <div className="container">
      <h2>רישום</h2>
      <div className="input-group">
        <div className="row">
        <input className="family-name-input"
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="שם משפחה"
            required
          />
          <input className="name-input"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="שם פרטי"
            required
          />
        </div>
        <div className="row">
          <input className="date-input"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            placeholder="תאריך לידה"
            required
          />
          <div className="gender-select">
            <select value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="">בחר מין</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
            </select>
          </div>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="דואר אלקטרוני"
          required
        />
        <input
          type="text"
          value={personalUsername}
          onChange={(e) => setPersonalUsername(e.target.value)}
          placeholder="שם משתמש אישי"
          required
        />
        <div className="password-input-container">
          <input 
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            required
          />
            <button 
              className="show-password-btn" 
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
            {showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            </button>
          </div>


        <div className="joining-buttons">
          <button onClick={() => setJoiningExistingFamily(!joiningExistingFamily)}>
            {joiningExistingFamily ? 'בטל הצטרפות למשפחה' : '?האם תרצה להצטרף למשפחה קיימת'}
          </button>
        </div>

        </div>

        <div className="input-group">

        <input
          type="text"
          value={familyUsername}
          onChange={(e) => setFamilyUsername(e.target.value)}
          placeholder="שם משתמש משפחתי"
          required
        />
        {joiningExistingFamily && (
          <input
            type="password"
            value={familyPassword}
            onChange={(e) => setFamilyPassword(e.target.value)}
            placeholder="סיסמת משפחה"
            required
          />
        )}

      </div>



      <div className="primary-buttons">
        <button onClick={handleRegister}>בצע רישום</button>
      </div>

    </div>
  );
};

export default RegisterPage;

