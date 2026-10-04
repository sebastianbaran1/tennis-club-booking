import { useOutletContext, Navigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Reservation from "./components/Reservation";
import "./Profile.css";
import useWindowConfirm from "./hooks/useWindowConfirm";

export default function Profile() {
  const { user, isUserLoading, setAlertMessage } = useOutletContext();
  const [myReservations, setMyReservations] = useState([]);
  const [activeTab, setActiveTab] = useState("Active");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, windowConfirm] = useWindowConfirm(
    "Potwierdzenie",
    "Czy na pewno chcesz odwołać rezerwację",
    "",
    "Anuluj",
    "Odwołaj",
  );

  const currentWarsawTime = useMemo(() => {
    const timeNow = new Intl.DateTimeFormat("pl-PL", {
      timeZone: "Europe/Warsaw",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    const dateNow = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Warsaw",
    }).format(new Date());

    return `${dateNow}T${timeNow}`;
  }, []);

  const activeReservations = useMemo(() => {
    return myReservations.filter(
      (res) => `${res.date}T${res.startTime}` >= currentWarsawTime,
    );
  }, [myReservations, currentWarsawTime]);

  const pastReservations = useMemo(() => {
    return myReservations.filter(
      (res) => `${res.date}T${res.startTime}` < currentWarsawTime,
    );
  }, [myReservations, currentWarsawTime]);

  useEffect(() => {
    if (!user || isUserLoading) return;

    const fetchMyReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${user.id}/reservations`,
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
    const confirm = await windowConfirm();
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reservations/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setAlertMessage("Rezerwacja odwołana!");
        setMyReservations((prev) => prev.filter((r) => r.id !== reservationId));
      } else {
        const data = await response.json();
        setAlertMessage(data.error);
      }
    } catch (error) {
      setAlertMessage("Błąd połączenia z serwerem.");
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile">
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
            <button
              onClick={() => setActiveTab("Active")}
              className={activeTab === "Active" ? "active" : ""}
              type="button"
            >
              Aktywne
            </button>
            <button
              onClick={() => setActiveTab("Past")}
              className={activeTab === "Past" ? "active" : ""}
              type="button"
            >
              Historia
            </button>
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
                    <Reservation
                      key={res.id}
                      res={res}
                      handleCancelReservation={handleCancelReservation}
                    />
                  ))}
                </div>
              )
            ) : pastReservations.length === 0 ? (
              <p className="profile-no-data">Brak historii rezerwacji.</p>
            ) : (
              <div className="profile-reservations-list past">
                {pastReservations.map((res) => (
                  <Reservation key={res.id} res={res} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmModal}
    </div>
  );
}
