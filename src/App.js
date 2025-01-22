import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/login/LoginPage';
import RegisterPage from './components/login/RegisterPage';
import FamilyPage from './components/family/FamilyPage'; // רכיב לדף המשפחה
import AddChild from './components/family/AddChild'; // רכיב לדף הוספת ילד
import ChildCard from './components/children/ChildCard'; // רכיב לדף הילד
import GrowthStages from './components/children/GrowthStages'; 
import DoctorVisits from './components/children/DoctorVisits'; 
import Vaccinations from './components/children/Vaccinations'; 
import GrowthSize from './components/children/GrowthSize'; 
import UpdateChild from './components/children/UpdateChild'; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/family/:familyUsername/:personalUsername" element={<FamilyPage />} />
        <Route path="/AddChild/:familyUsername" element={<AddChild />} />
        <Route path="/ChildCard/:childId/:personalUsername" element={<ChildCard />} />
        <Route path="/children/GrowthStages/:childId" element={<GrowthStages />} />

        <Route path="/children/DoctorVisits/:childId" element={<DoctorVisits />} />
        <Route path="/children/Vaccinations/:childId" element={<Vaccinations />} />
        <Route path="/children/GrowthSize/:childId" element={<GrowthSize />} />
        <Route path="/children/UpdateChild/:childId/:personalUsername" element={<UpdateChild />} />

      </Routes>
    </Router>
  );
}

export default App;

