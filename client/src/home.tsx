import { useEffect, useState } from "react";
import "./home.css"; // Ensure you create a corresponding CSS file for styling

interface HomeData {
  title: string;
  welcomeMessage: string;
  features: string[];
}

const Home = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5175/api/home")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        console.log("Raw Response:", text);
        try {
          const jsonData = JSON.parse(text);
          setData(jsonData);
        } catch (parseError) {
          setError("Invalid JSON received from server.");
        }
      })
      .catch((error) => setError(error.message));
  }, []);

  if (error) return <p className="error-message">Error: {error}</p>;
  if (!data) return <p className="loading-message">Loading...</p>;

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>{data.title}</h1>
          <p>{data.welcomeMessage}</p>
          <button className="cta-button">Get Started</button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          {data.features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3>{feature}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
