import { useOutletContext, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Profile.css";

export default function Profile() {
  const { user, isUserLoading } = useOutletContext();
  const [myReservations, setMyReservations] = useState([]);
  const [activeTab, setActiveTab] = useState("Active");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = new Date();

  useEffect(() => {
    if (!user || isUserLoading) return;

    const fetchMyReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5005/api/users/${user.id}/reservations`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();

        if (response.ok) {
          setMyReservations(data.reservations);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Błąd połączenia z serwerem.");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchMyReservations();
  }, [user, isUserLoading]);

  if (isUserLoading) {
    return (
      <div className="profile-loading">
        <h2>Wczytywanie profilu...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (isDataLoading) {
    return (
      <div className="profile-loading">
        <h2>Wczytywanie rezerwacji...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <h2>Ups, coś poszło nie tak!</h2>
        <p>{error}</p>
      </div>
    );
  }

  const handleCancelReservation = async (reservationId) => {
    const confirm = window.confirm(
      "Czy na pewno chcesz odwołać tę rezerwację?",
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5005/api/reservations/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        alert("Rezerwacja odwołana!");
        setMyReservations(myReservations.filter((r) => r.id !== reservationId));
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd połączenia z serwerem.");
    }
  };

  const activeReservations = myReservations.filter(
    (res) => new Date(`${res.date}T${res.startTime}`) >= now,
  );

  const pastReservations = myReservations.filter(
    (res) => new Date(`${res.date}T${res.startTime}`) < now,
  );

  return (
    <div className="profile-container">
      <h1 className="profile-title">Moje Konto</h1>
      <div className="profile-user-info">
        <h3>Dane gracza</h3>
        <div className="profile-user-info-grid">
          <span className="profile-info">
            <span className="profile-info-label">Imię:</span> {user.firstName}
          </span>
          <span className="profile-info">
            <span className="profile-info-label">Nazwisko:</span>
            {user.lastName}
          </span>
          <span className="profile-info">
            <span className="profile-info-label">Telefon:</span> {user.phone}
          </span>
          <span className="profile-info">
            <span className="profile-info-label">Email:</span> {user.email}
          </span>
        </div>
      </div>
      <div className="profile-reservations">
        <div className="profile-reservations-header">
          <h2
            onClick={() => setActiveTab("Active")}
            className={activeTab === "Active" ? "active" : ""}
          >
            Aktywne
          </h2>
          <h2
            onClick={() => setActiveTab("Past")}
            className={activeTab === "Past" ? "active" : ""}
          >
            Historia
          </h2>
        </div>
        <div className="profile-reservations-content">
          {activeTab === "Active" ? (
            activeReservations.length === 0 ? (
              <p className="profile-no-data">
                Nie masz zaplanowanych żadnych gier. Zarezerwuj kort!
              </p>
            ) : (
              <div className="profile-reservations-list">
                {activeReservations.map((res) => (
                  <div key={res.id} className="reservation-card">
                    <div>
                      <h3 className="reservation-card__date">{res.date}</h3>
                      <p className="reservation-card__detail">
                        <span className="profile-info-label">Godzina:</span>{" "}
                        {res.startTime} ({res.duration} min)
                      </p>
                      <p className="reservation-card__location">
                        Miejsce: {res.court.name} ({res.court.surface})
                      </p>
                    </div>

                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelReservation(res.id)}
                    >
                      Anuluj
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : pastReservations.length === 0 ? (
            <p className="profile-no-data">Brak historii rezerwacji.</p>
          ) : (
            <div className="profile-reservations-list past">
              {pastReservations.map((res) => (
                <div key={res.id} className="reservation-card">
                  <div>
                    <h3 className="reservation-card__date">{res.date}</h3>
                    <p className="reservation-card__detail">
                      <span className="profile-info-label">Godzina:</span>{" "}
                      {res.startTime} ({res.duration} min)
                    </p>
                    <p className="reservation-card__location">
                      Miejsce: {res.court.name} ({res.court.surface})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
