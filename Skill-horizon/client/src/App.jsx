import Login from './components/Login'
import Profile from './Pages/Profile'
import Home from './Pages/Home'
import LearningPlans from './Pages/LearningPlans' 
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/learning-plans" element={<LearningPlans />} /> 
      </Routes>
    </Router>
  )
}

export default App
