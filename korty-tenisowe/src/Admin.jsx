import { useState, useEffect } from "react";
import "./Admin.css";

const daysOrder = [1, 2, 3, 4, 5, 6, 0];

export default function Admin() {
  const [schedule, setSchedule] = useState({
    1: { name: "Poniedziałek", open: "08:00", close: "22:00" },
    2: { name: "Wtorek", open: "08:00", close: "22:00" },
    3: { name: "Środa", open: "08:00", close: "22:00" },
    4: { name: "Czwartek", open: "08:00", close: "22:00" },
    5: { name: "Piątek", open: "08:00", close: "22:00" },
    6: { name: "Sobota", open: "09:00", close: "20:00" },
    0: { name: " Niedziela", open: "10:00", close: "18:00" },
  });

  const [courts, setCourts] = useState([
    { id: 1, name: "Kort 1", surface: "Mączka" },
  ]);
  const [refreshCourts, setRefreshCourts] = useState(0);

  const handleTimeChange = (key, fieldName, newValue) => {
    setSchedule({
      ...schedule,
      [key]: { ...schedule[key], [fieldName]: newValue },
    });
  };

  const handleSubmitSchedule = async () => {
    try {
      const response = await fetch("http://localhost:5005/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Harmonogram został zaktualizowany!");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd połączenia z serwerem.");
    }
  };

  const handleCourtsChange = (courtId, fieldName, newValue) => {
    setCourts(
      courts.map((court) =>
        court.id === courtId ? { ...court, [fieldName]: newValue } : court,
      ),
    );
  };

  const handleDeleteCourt = async (courtId) => {
    try {
      const response = await fetch(
        `http://localhost:5005/api/courts/${courtId}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        alert("Kort został usunięty!");
        setRefreshCourts((prev) => prev + 1);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd serwera.");
    }
  };

  const handleSaveCourt = async (courtId) => {
    const courtToUpdate = courts.find((court) => court.id === courtId);
    try {
      const response = await fetch(
        `http://localhost:5005/api/courts/${courtId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: courtToUpdate.name,
            surface: courtToUpdate.surface,
          }),
        },
      );
      if (response.ok) {
        alert("Kort został zaktualizowany!");
        setRefreshCourts((prev) => prev + 1);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd serwera.");
    }
  };

  const handleAddCourt = async () => {
    try {
      const response = await fetch("http://localhost:5005/api/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nowy kort", surface: "Mączka" }),
      });
      if (response.ok) {
        const newCourt = await response.json();
        setRefreshCourts((prev) => prev + 1);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd serwera.");
    }
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("http://localhost:5005/api/settings");
        const data = await response.json();
        if (response.ok) {
          setSchedule(data.schedule);
        }
      } catch (error) {
        alert("Błąd połączenia z serwerem.");
      }
    };
    fetchSchedule();
  }, []);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await fetch("http://localhost:5005/api/courts");
        const data = await response.json();
        if (response.ok) {
          setCourts(data);
        }
      } catch (error) {
        alert("Błąd połączenia z serwerem.");
      }
    };
    fetchCourts();
  }, [refreshCourts]);

  return (
    <div className="admin-contanier">
      <div className="schedule">
        {daysOrder.map((key) => {
          const dayData = schedule[key];
          return (
            <div key={key}>
              {dayData.name}
              <input
                type="time"
                className="schedule__input-open"
                value={dayData.open}
                onChange={(e) => handleTimeChange(key, "open", e.target.value)}
              />
              <input
                type="time"
                className="schedule__input-close"
                value={dayData.close}
                onChange={(e) => handleTimeChange(key, "close", e.target.value)}
              />
            </div>
          );
        })}
        <div className="schedule__button-submit">
          <button type="button" onClick={handleSubmitSchedule}>
            Zapisz zmiany
          </button>
        </div>
      </div>
      <div className="courts">
        {courts.map((court, index) => (
          <div className="court" key={court.id}>
            <input
              type="text"
              value={court.name}
              onChange={(e) =>
                handleCourtsChange(court.id, "name", e.target.value)
              }
            />
            <input
              type="text"
              value={court.surface}
              onChange={(e) =>
                handleCourtsChange(court.id, "surface", e.target.value)
              }
            />
            <button
              className="court__button-save"
              type="button"
              onClick={() => handleSaveCourt(court.id)}
            >
              Zapisz
            </button>
            <button
              className="court__button-delete"
              onClick={() => handleDeleteCourt(court.id)}
            >
              Usuń
            </button>
          </div>
        ))}
        <button
          className="courts__button-add"
          type="button"
          onClick={() => handleAddCourt()}
        >
          Dodaj kort
        </button>
      </div>
    </div>
  );
}
