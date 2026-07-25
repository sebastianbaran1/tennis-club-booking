import { useState, useEffect } from "react";
import "./Admin.css";
import bin from "./assets/bin.png";
import edit from "./assets/edit.png";
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
          <div className="schedule-title">
            <h2>Harmonogram</h2>
          </div>{" "}
          <div className="schedule__day-list">
            {daysOrder.map((key) => {
              const dayData = schedule[key];
              return (
                <div className="schedule__day" key={key}>
                  <div className="schedule__day-name">{dayData.name}</div>
                  <div className="schedule__day-settings">
                    <input
                      type="time"
                      className="schedule__input-open"
                      value={dayData.open}
                      onChange={(e) =>
                        handleTimeChange(key, "open", e.target.value)
                      }
                    />
                    <div className="schedule__separator">-</div>
                    <input
                      type="time"
                      className="schedule__input-close"
                      value={dayData.close}
                      onChange={(e) =>
                        handleTimeChange(key, "close", e.target.value)
                      }
                    />
                  </div>
                </div>
              );
            })}
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
        <div className="courts-wrapper">
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
                <span className="courts__button-add-plus">+</span> DODAJ NOWY
                KORT
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
                    <div
                      className={`court__info-status ${court.isBlocked === false ? "available" : "blocked"}`}
                    >
                      {court.isBlocked === false ? (
                        <span className="court__info-status-available">
                          Dostępny
                        </span>
                      ) : (
                        <div className="court__info-status-blocked-wrapper">
                          <span className="court__info-status-blocked">
                            Zablokowany
                          </span>
                          <span className="court__info-status-blocked-reason">
                            {court.blockReason}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="court__actions">
                      <button
                        className="court__actions-button-edit"
                        type="button"
                        onClick={() => {
                          toggleEdit(court);
                        }}
                      >
                        <img src={edit} alt="Edytuj" className="edit-icon" />
                        {court.id === courtToEdit ? "Anuluj" : "Edytuj"}
                      </button>
                      <button
                        className="court__actions-button-delete"
                        onClick={() => handleDeleteCourt(court.id)}
                      >
                        <img src={bin} alt="Usuń" className="delete-icon" />
                        Usuń
                      </button>
                    </div>
                  </div>
                  {courtToEdit === court.id && (
                    <div className="court-edit-wrapper">
                      <div className="court-edit">
                        <div className="court-edit-text-input-wrapper">
                          <input
                            type="text"
                            value={editFormData.name}
                            className="court-edit-text-input"
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="court-edit-text-input-wrapper">
                          <input
                            type="text"
                            value={editFormData.surface}
                            className="court-edit-text-input"
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                surface: e.target.value,
                              })
                            }
                          />
                        </div>
                        <fieldset className="court__fieldset-block">
                          <div className="court__fieldset-block-false">
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
                            />{" "}
                            <label htmlFor={`court-${court.id}-avalible`}>
                              Dostępny
                            </label>
                          </div>
                          <div className="court__fieldset-block-true">
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
                            <label htmlFor={`court-${court.id}-blocked`}>
                              Zablokowany
                            </label>
                          </div>
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="users-wrapper">
          <div className="users">
            <div className="users__header">
              <div className="users__header-title">
                <h2>Lista użytkowników</h2>
              </div>
              <div className="users__header-filters">
                <div className="users__header-search">
                  <label htmlFor="users__search">Wyszukaj klienta</label>
                  <input
                    type="text"
                    name="users__search"
                    id="users__search"
                    placeholder="Imię, nazwisko, telefon, e-mail"
                  />
                </div>
                <div className="users__header-dropdown">
                  <label htmlFor="users__select">Wybierz role</label>
                  <select name="users__select" id="users__select">
                    <option value="all">Wszystkie role</option>
                    <option value="GUEST">Gość</option>
                    <option value="USER">Użytkownik</option>
                    <option value="RECEPTIONIST">Recepcjonista</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="users__list-header">
              <h3>Imię</h3>
              <h3>Nazwisko</h3>
              <h3>E-mail</h3>
              <h3>Telefon</h3>
              <h3>Rola</h3>
              <h3>Dołączył(a)</h3>
              <h3>Akcje</h3>
            </div>
            {users.map((user, index) => (
              <div className="users__list-user" key={user.id}>
                <div className="user__name">{user.firstName}</div>
                <div className="user__lastname">{user.lastName}</div>
                <div className="user__email">{user.email}</div>
                <div className="user__phone">{user.phone}</div>
                <div className="user__role">{user.role}</div>
                <div className="user__createdat">{user.createdAt}</div>
                <div className="user__actions">
                  <button className="user__actions-button-edit" type="button">
                    <img src={edit} alt="Edytuj" className="edit-icon" />
                    Edytuj
                  </button>
                  <button className="user__actions-button-delete" type="button">
                    <img src={bin} alt="Usuń" className="delete-icon" />
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
