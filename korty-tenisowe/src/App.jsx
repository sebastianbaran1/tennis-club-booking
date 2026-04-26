import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await fetch("http://localhost:5005/api/verify", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error(
            "Brak połączenia z serwerem podczas weryfikacji:",
            error,
          );
        }
      }
    };

    checkSession();
  }, []);

  const handleLoginSubmit = async (formData) => {
    try {
      const response = await fetch("http://localhost:5005/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setIsLoginOpen(false);
      } else {
        alert("Błąd: " + data.error);
      }
    } catch (error) {
      console.error("Błąd połączenia z serwerem:", error);
      alert("Nie można połączyć się z serwerem.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);

    alert("Wylogowano pomyślnie. Do zobaczenia na korcie!");
  };

  const handleRegisterSubmit = async (formData) => {
    try {
      const response = await fetch("http://localhost:5005/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsRegisterOpen(false);
      } else {
        alert("Błąd: " + data.error);
      }
    } catch (error) {
      console.error("Błąd połączenia z serwerem:", error);
    }
  };

  return (
    <div className="app-container">
      <Header
        user={user}
        onLogout={handleLogout}
        onLoginOpen={() => setIsLoginOpen(true)}
        onRegisterOpen={() => setIsRegisterOpen(true)}
      />

      <Navbar onLogout={handleLogout} />

      <div className="main-content">
        <Outlet context={{ user, setIsLoginOpen }} />
      </div>

      <Footer />

      <AuthModal
        isOpen={isLoginOpen}
        type="login"
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLoginSubmit}
      />

      <AuthModal
        isOpen={isRegisterOpen}
        type="register"
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleRegisterSubmit}
      />
    </div>
  );
}
export default App;
