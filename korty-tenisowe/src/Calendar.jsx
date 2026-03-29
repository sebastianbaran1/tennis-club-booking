import { useOutletContext, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Calendar.css";

const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h <= 21; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
};
const timeSlots = generateTimeSlots();

export default function Calendar() {
  const { user } = useOutletContext();
  const [courts, setCourts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    courtId: null,
    startTime: null,
  });
  const [bookingDuration, setBookingDuration] = useState(60);

  const isPastSlot = (slotTime) => {
    if (selectedDate < todayStr) return true;
    if (selectedDate > todayStr) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return timeToMinutes(slotTime) <= currentMinutes;
  };

  useEffect(() => {
    const fetchDayData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5005/api/reservations?date=${selectedDate}`
        );
        const data = await response.json();
        if (response.ok) {
          setCourts(data.courts || []);
          setReservations(data.reservations || []);
        } else {
          setCourts([]);
          setReservations([]);
        }
      } catch (error) {
        setCourts([]);
        setReservations([]);
      }
    };
    fetchDayData();
  }, [selectedDate]);

  if (!user) return <Navigate to="/" />;

  const handleOpenBookingModal = (courtId, startTime) => {
    setBookingModal({ isOpen: true, courtId, startTime });
    setBookingDuration(60);
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    const { courtId, startTime } = bookingModal;
    try {
      const response = await fetch("http://localhost:5005/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          date: selectedDate,
          startTime,
          duration: bookingDuration,
          userId: user.id,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setBookingModal({ isOpen: false, courtId: null, startTime: null });
        setReservations([
          ...reservations,
          { ...data.reservation, user: { firstName: user.firstName } },
        ]);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd połączenia z serwerem.");
    }
  };

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
        setReservations(reservations.filter((r) => r.id !== reservationId));
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd serwera.");
    }
  };

  const getRowIndex = (time) => {
    const startMin = timeToMinutes("08:00");
    return (timeToMinutes(time) - startMin) / 30 + 2;
  };

  return (
    <div className="calendar-container">
      <h1 className="calendar-title">Kalendarz Rezerwacji</h1>

      <div className="calendar-controls">
        <label className="calendar-date-label">Wybierz dzień: </label>
        <input
          type="date"
          value={selectedDate}
          min={todayStr}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="calendar-date-input"
        />
      </div>

      <div className="calendar-grid-wrapper">
        <div
          className="calendar-grid"
          style={{ "--court-count": courts.length }}
        >
          <div
            className="grid-header grid-header-hour"
            style={{ gridRow: 1, gridColumn: 1 }}
          >
            Godzina
          </div>

          {courts?.map((court, index) => (
            <div
              className="grid-header"
              key={court.id}
              style={{ gridRow: 1, gridColumn: index + 2 }}
            >
              <span className="grid-header__name">{court.name}</span>
              <span className="grid-header__surface">{court.surface}</span>
            </div>
          ))}

          {timeSlots.map((slotTime, index) => (
            <div
              className="grid-time"
              key={`time-${slotTime}`}
              style={{ gridRow: index + 2, gridColumn: 1 }}
            >
              {slotTime}
            </div>
          ))}

          {timeSlots.map((slotTime, rIndex) =>
            courts?.map((court, cIndex) => {
              const past = isPastSlot(slotTime);
              return (
                <div
                  className={`empty-slot ${past ? "slot-past" : ""}`}
                  key={`empty-${court.id}-${slotTime}`}
                  style={{ gridRow: rIndex + 2, gridColumn: cIndex + 2 }}
                  onClick={() =>
                    !past && handleOpenBookingModal(court.id, slotTime)
                  }
                >
                  {past ? "Minęło" : "+ Rezerwuj"}
                </div>
              );
            })
          )}

          {reservations.map((res) => {
            const rowStart = getRowIndex(res.startTime);
            const rowSpan = res.duration / 30;
            const colIndex = courts.findIndex((c) => c.id === res.courtId) + 2;

            const isMyRes = res.userId === user.id;
            const isAdmin = user.role === "ADMIN";
            const canCancel = isMyRes || isAdmin;

            return (
              <div
                className={`reservation-block ${
                  isMyRes ? "res-mine" : "res-taken"
                }`}
                key={`res-${res.id}`}
                style={{
                  gridRow: `${rowStart} / span ${rowSpan}`,
                  gridColumn: colIndex,
                  cursor: canCancel ? "pointer" : "not-allowed",
                }}
                onClick={() => canCancel && handleCancelReservation(res.id)}
              >
                <span>{isMyRes ? "Twoja gra" : "Zajęte"}</span>

                {isAdmin ? (
                  <span className="reservation-admin-details">
                    {res.user?.firstName} {res.user?.lastName} <br />
                    Nr. tel: {res.user?.phone}
                  </span>
                ) : (
                  <span className="reservation-user-details">
                    {isMyRes ? "(kliknij by usunąć)" : res.user?.firstName}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {bookingModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="modal__close"
              onClick={() =>
                setBookingModal({
                  isOpen: false,
                  courtId: null,
                  startTime: null,
                })
              }
            >
              ✕
            </button>
            <h2 className="modal__title">Potwierdź rezerwację</h2>
            <p className="modal__subtitle">
              Rezerwujesz kort od{" "}
              <span className="modal__time-highlight">
                {bookingModal.startTime}
              </span>{" "}
              ({selectedDate}).
            </p>
            <form className="modal__form" onSubmit={confirmBooking}>
              <div className="modal__form-group">
                <label className="modal__form-label">Czas trwania gry:</label>
                <div className="modal__radio-group">
                  <label className="modal__radio-label">
                    <input
                      type="radio"
                      value={60}
                      checked={bookingDuration === 60}
                      onChange={() => setBookingDuration(60)}
                    />
                    60 minut
                  </label>
                  <label className="modal__radio-label">
                    <input
                      type="radio"
                      value={90}
                      checked={bookingDuration === 90}
                      onChange={() => setBookingDuration(90)}
                    />
                    90 minut
                  </label>
                </div>
              </div>
              <button type="submit" className="modal__submit">
                Zarezerwuj i graj!
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
