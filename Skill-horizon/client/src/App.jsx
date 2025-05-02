import Login from './components/Login'
import Profile from './Pages/Profile'
import Home from './Pages/Home'
import LearningPlans from './Pages/LearningPlans'
import Navbar from './components/Navbar'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="app-container">
      {!isLoginPage && <Navbar />}
      <main className={`main-content ${isLoginPage ? 'login-page' : ''}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/learning-plan" element={<LearningPlans />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
