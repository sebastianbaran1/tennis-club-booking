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
    {
      id: 1,
      name: "Kort 1",
      surface: "Mączka",
      isBlocked: false,
      blockReason: "",
    },
  ]);

  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: "Sebastian",
      lastName: "Baran",
      email: "sbaran@test.pl",
      phone: "123123123",
      role: "USER",
      createdAt: "2026-07-22T20:05:48.000Z",
    },
  ]);

  const [refreshCourts, setRefreshCourts] = useState(0);
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [courtToEdit, setCourtToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const toggleEdit = (court) => {
    if (court.id === courtToEdit) {
      setCourtToEdit(null);
    } else {
      setCourtToEdit(court.id);
      setEditFormData(court);
    }
  };

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
    try {
      const response = await fetch(
        `http://localhost:5005/api/courts/${courtId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editFormData.name,
            surface: editFormData.surface,
            isBlocked: editFormData.isBlocked,
            blockReason: editFormData.blockReason,
          }),
        },
      );
      if (response.ok) {
        alert("Kort został zaktualizowany!");
        setRefreshCourts((prev) => prev + 1);
        setCourtToEdit(null);
        setEditFormData({});
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
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5005/api/usersAdmin");
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
        }
      } catch (error) {
        alert("Błąd połączenia z serwerem.");
      }
    };
    fetchUsers();
  }, [refreshUsers]);

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
    <div className="admin-container">
      <h1 className="admin__header">Panel administratora</h1>
      <div className="admin__content-container">
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
                  onChange={(e) =>
                    handleTimeChange(key, "open", e.target.value)
                  }
                />
                <input
                  type="time"
                  className="schedule__input-close"
                  value={dayData.close}
                  onChange={(e) =>
                    handleTimeChange(key, "close", e.target.value)
                  }
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
          <div className="courts__header">
            <div className="courts__header-title">
              <h2>Lista kortów</h2>
            </div>
            <button
              className="courts__button-add"
              type="button"
              onClick={() => handleAddCourt()}
            >
              Dodaj kort
            </button>
          </div>
          <div className="courts__list">
            <div className="courts__list-header">
              <h3>Nazwa Kortu</h3>
              <h3>Nawierzchnia</h3>
              <h3>Status</h3>
              <h3>Akcje</h3>
            </div>
            {courts.map((court, index) => (
              <div className="court-wrapper">
                <div className="court" key={court.id}>
                  <div className="court__info">{court.name}</div>
                  <div className="court__info">{court.surface}</div>
                  <div className="court__info">
                    {court.isBlocked === false ? "Dostępny" : "Zablokowany"}
                  </div>
                  <div className="court__actions">
                    <button
                      className="edit"
                      type="button"
                      onClick={() => {
                        toggleEdit(court);
                      }}
                    >
                      Edytuj
                    </button>{" "}
                    <button
                      className="court__button-delete"
                      onClick={() => handleDeleteCourt(court.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
                {courtToEdit === court.id && (
                  <div className="court-edit">
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      value={editFormData.surface}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          surface: e.target.value,
                        })
                      }
                    />
                    <fieldset className="court__fieldset-block">
                      <label htmlFor={`court-${court.id}-avalible`}>
                        <input
                          type="radio"
                          name={`status-${court.id}`}
                          id={`court-${court.id}-avalible`}
                          checked={editFormData.isBlocked === false}
                          onChange={() =>
                            setEditFormData({
                              ...editFormData,
                              isBlocked: false,
                            })
                          }
                        />
                        Dostępny
                      </label>
                      <label htmlFor={`court-${court.id}-blocked`}>
                        <input
                          type="radio"
                          name={`status-${court.id}`}
                          id={`court-${court.id}-blocked`}
                          checked={editFormData.isBlocked === true}
                          onChange={() =>
                            setEditFormData({
                              ...editFormData,
                              isBlocked: true,
                            })
                          }
                        />{" "}
                        Zablokowany
                      </label>
                    </fieldset>
                    <div className="court__actions-block">
                      <label htmlFor={`court-${court.id}-block-reason`}>
                        Powód blokady:
                      </label>
                      <input
                        type="text"
                        name={`block-reason-${court.id}`}
                        id={`court-${court.id}-block-reason`}
                        value={editFormData.blockReason || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            blockReason: e.target.value,
                          })
                        }
                      />
                      <button
                        className="court__button-save"
                        type="button"
                        onClick={() => handleSaveCourt(court.id)}
                      >
                        Zapisz
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="users">
          {users.map((user, index) => (
            <div className="users__user" key={user.id}>
              <div className="users__user-name">{user.firstName}</div>
              <div className="users__user-name">{user.lastName}</div>
              <div className="users__user-name">{user.email}</div>
              <div className="users__user-name">{user.phone}</div>
              <div className="users__user-name">{user.role}</div>
              <div className="users__user-name">{user.createdAt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
