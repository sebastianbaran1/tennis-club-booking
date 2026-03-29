import { useOutletContext, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Profile.css";

export default function Profile() {
  const { user } = useOutletContext();
  const [myReservations, setMyReservations] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchMyReservations = async () => {
      try {
        const response = await fetch(
          `http://localhost:5005/api/users/${user.id}/reservations`
        );
        if (response.ok) {
          const data = await response.json();
          setMyReservations(data);
        }
      } catch (error) {
        console.error("Błąd pobierania rezerwacji:", error);
      }
    };

    fetchMyReservations();
  }, [user]);

  if (!user) {
    return <Navigate to="/" />;
  }

  const handleCancelReservation = async (reservationId) => {
    const confirm = window.confirm(
      "Czy na pewno chcesz odwołać tę rezerwację?"
    );
    if (!confirm) return;

    try {
      const response = await fetch(
        `http://localhost:5005/api/reservations/${reservationId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }
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

  return (
    <div className="profile-container">
      <h1 className="profile-title">Moje Konto</h1>

      <div className="profile-user-info">
        <h3>Dane gracza</h3>
        <span className="profile-info-row">
          <span className="profile-info-label">Imię:</span> {user.firstName}
        </span>
        <span className="profile-info-row">
          <span className="profile-info-label">Email:</span> {user.email}
        </span>
      </div>

      <h2 className="profile-subtitle">Moje nadchodzące gry:</h2>

      {myReservations.length === 0 ? (
        <p className="profile-no-data">
          Nie masz zaplanowanych żadnych gier. Zarezerwuj kort!
        </p>
      ) : (
        <div className="profile-reservations-list">
          {myReservations.map((res) => (
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
                Odwołaj
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
