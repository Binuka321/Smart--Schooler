import Login from './components/Login'
import Profile from './Pages/Profile'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile/>}/>
      </Routes>
    </Router>
  )
}

export default App
