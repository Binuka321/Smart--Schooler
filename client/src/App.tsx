import "./App.css";
import Home from "./home";

function App() {
  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h2>LMS</h2>
        <ul>
          <li><a href="">Home</a></li>
          <li><a href="#">Courses</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Welcome to Our Learning Management System</h1>
        <p>Learn at your own pace with expert-led courses</p>
        <button className="cta-button">Explore Courses</button>
      </header>

      {/* LMS Home Page (Course Previews, etc.) */}
      <main className="main-content">
        <Home />
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Learning Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
