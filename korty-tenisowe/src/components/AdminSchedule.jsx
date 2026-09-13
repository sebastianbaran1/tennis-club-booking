import { useState, useEffect, useRef } from "react";
import clock from "../assets/clock.png";

const daysOrder = [1, 2, 3, 4, 5, 6, 0];
const timeSlots = ["--:--"];

for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    let hourStr = h.toString().padStart(2, "0");
    let minStr = m.toString().padStart(2, "0");
    timeSlots.push(`${hourStr}:${minStr}`);
  }
}

export default function AdminSchedule() {
  const [activeTab, setActiveTab] = useState("weekly");
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [schedule, setSchedule] = useState({
    1: { name: "Poniedziałek", open: "08:00", close: "22:00" },
    2: { name: "Wtorek", open: "08:00", close: "22:00" },
    3: { name: "Środa", open: "08:00", close: "22:00" },
    4: { name: "Czwartek", open: "08:00", close: "22:00" },
    5: { name: "Piątek", open: "08:00", close: "22:00" },
    6: { name: "Sobota", open: "08:00", close: "22:00" },
    0: { name: " Niedziela", open: "08:00", close: "22:00" },
  });
  const [slotToOpen, setSlotToOpen] = useState({ key: null, type: null });
  const [newClosedDay, setNewClosedDay] = useState("");
  const [isExceptionsLoading, setIsExceptionsLoading] = useState(true);
  const [closedDays, setClosedDays] = useState([]);
  const selectedTimeRef = useRef(null);
  const [error, setError] = useState(null);

  const handleTimeChange = (key, fieldName, newValue) => {
    setSchedule({
      ...schedule,
      [key]: { ...schedule[key], [fieldName]: newValue },
    });
  };

  const timeToMinutes = (timeString) => {
    if (timeString === "00:00") return 24 * 60;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const isScheduleValid = (openString, closeString) => {
    if (openString === "--:--" && closeString === "--:--") return true;
    if (openString === "--:--" || closeString === "--:--") return false;
    return timeToMinutes(closeString) - timeToMinutes(openString) > 0;
  };

  const handleSubmitSchedule = async () => {
    for (let i = 0; i <= 6; i++) {
      if (isScheduleValid(schedule[i].open, schedule[i].close) === false) {
        alert("Godzina zamknięcia musi być późniejsza niż godzina otwarcia!");
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5005/api/settings/schedule",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ schedule }),
        },
      );
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

  const handleAddNewClosedDay = () => {
    if (newClosedDay === "") return alert("Wybierz dzień");
    if (closedDays.includes(newClosedDay))
      return alert("Ten dzień juz jest na liście ");

    setClosedDays(
      [...closedDays, newClosedDay].sort((a, b) => new Date(a) - new Date(b)),
    );
    setNewClosedDay("");
  };

  const handleSubmitExceptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5005/api/settings/exceptions",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ closedDays }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert("Dni wolne zostały zaktualizowane!");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd połączenia z serwerem.");
    }
  };

  useEffect(() => {
    const fetchExceptions = async () => {
      try {
        const response = await fetch(
          "http://localhost:5005/api/settings/exceptions",
        );
        const data = await response.json();
        if (response.ok) {
          setClosedDays(data.exceptions);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Błąd połączenia z serwerem.");
      } finally {
        setIsExceptionsLoading(false);
      }
    };
    fetchExceptions();
  }, []);

  useEffect(() => {
    if (slotToOpen.key !== null && selectedTimeRef.current) {
      const li = selectedTimeRef.current;
      const ul = li.parentElement;

      ul.scrollTop = li.offsetTop - 3;
    }
  }, [slotToOpen]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setSlotToOpen({ key: null, type: null });
    };

    if (slotToOpen.key !== null) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [slotToOpen]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          "http://localhost:5005/api/settings/schedule",
        );
        const data = await response.json();
        if (response.ok) {
          setSchedule(data.schedule);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Błąd połączenia z serwerem.");
      } finally {
        setIsScheduleLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (error) {
    return (
      <div className="admin-error">
        <h2>Ups, coś poszło nie tak!</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="schedule">
      <div className="schedule-title">
        <h2>Harmonogram</h2>
      </div>
      <div className="schedule-tabs">
        <button
          type="button"
          className={`schedule-tab ${activeTab === "weekly" ? "active" : ""}`}
          onClick={() => setActiveTab("weekly")}
        >
          Tydzień
        </button>
        <button
          type="button"
          className={`schedule-tab ${activeTab === "exceptions" ? "active" : ""}`}
          onClick={() => setActiveTab("exceptions")}
        >
          Dni wolne
        </button>
      </div>
      {activeTab === "weekly" ? (
        <div className="schedule__weekly">
          <div className="schedule__day-list">
            {isScheduleLoading ? (
              <div>Ładowanie harmonogramu...</div>
            ) : (
              <>
                {daysOrder.map((key) => {
                  const dayData = schedule[key];
                  return (
                    <div className="schedule__day" key={key}>
                      <div className="schedule__day-name">{dayData.name}</div>
                      <div className="schedule__day-settings">
                        <div
                          className="schedule__day-setting"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSlotToOpen({ key: key, type: "open" });
                          }}
                        >
                          {dayData.open}
                          <img src={clock} alt="clock" className="clock" />
                          {slotToOpen.key === key &&
                            slotToOpen.type === "open" && (
                              <ul className="schedule__day-setting-list">
                                {timeSlots.map((timeSlot) => (
                                  <li
                                    ref={
                                      timeSlot === dayData.open
                                        ? selectedTimeRef
                                        : null
                                    }
                                    key={timeSlot}
                                    className={
                                      timeSlot === dayData.open ? "active" : ""
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTimeChange(key, "open", timeSlot);
                                      setSlotToOpen({
                                        key: null,
                                        type: null,
                                      });
                                    }}
                                  >
                                    {timeSlot}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                        <div className="schedule__separator">-</div>
                        <div
                          className="schedule__day-setting"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSlotToOpen({ key: key, type: "close" });
                          }}
                        >
                          {dayData.close}
                          <img src={clock} alt="clock" className="clock" />
                          {slotToOpen.key === key &&
                            slotToOpen.type === "close" && (
                              <ul className="schedule__day-setting-list">
                                {timeSlots.map((timeSlot) => (
                                  <li
                                    ref={
                                      timeSlot === dayData.close
                                        ? selectedTimeRef
                                        : null
                                    }
                                    key={timeSlot}
                                    className={
                                      timeSlot === dayData.close ? "active" : ""
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTimeChange(key, "close", timeSlot);
                                      setSlotToOpen({
                                        key: null,
                                        type: null,
                                      });
                                    }}
                                  >
                                    {timeSlot}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div className="schedule__button-submit-wrapper">
            <button
              className="schedule__button-submit"
              type="button"
              onClick={handleSubmitSchedule}
            >
              Zapisz zmiany
            </button>
          </div>
        </div>
      ) : (
        <div className="schedule__exceptions">
          <div className="schedule__exceptions-add-list-wrapper">
            <div className="schedule__exceptions-add">
              <input
                type="date"
                name="exception-date"
                id="schedule__exceptions-input"
                onChange={(e) => setNewClosedDay(e.target.value)}
              />
              <button
                type="button"
                className="schedule__exceptions-button"
                onClick={() => handleAddNewClosedDay()}
              >
                Dodaj
              </button>
            </div>
            <div className="schedule__exceptions-list">
              {isExceptionsLoading ? (
                <div>Ładowanie harmonogramu...</div>
              ) : (
                <>
                  {closedDays.map((day) => (
                    <div className="schedule__exceptions-item" key={day}>
                      <div className="schedule__exceptions-date">{day}</div>
                      <button
                        type="button"
                        className="schedule__exceptions-button-delete"
                        onClick={() =>
                          setClosedDays(closedDays.filter((d) => d !== day))
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="schedule__exceptions-button-submit-wrapper">
            <button
              className="schedule__exceptions-button-submit"
              type="button"
              onClick={handleSubmitExceptions}
            >
              Zapisz zmiany
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
