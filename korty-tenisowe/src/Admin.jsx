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

  const handleTimeChange = (key, fieldName, newValue) => {
    setSchedule({
      ...schedule,
      [key]: { ...schedule[key], [fieldName]: newValue },
    });
  };

  return (
    <div className="admin-contanier">
      {daysOrder.map((key) => {
        const dayData = schedule[key];
        return (
          <div key={key}>
            {dayData.name}
            <input
              type="time"
              value={dayData.open}
              onChange={(e) => handleTimeChange(key, "open", e.target.value)}
            />
            <input
              type="time"
              value={dayData.close}
              onChange={(e) => handleTimeChange(key, "close", e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}
