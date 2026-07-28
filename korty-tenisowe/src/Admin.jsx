import { useState, useEffect, use } from "react";
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
  const [userToEdit, setUserToEdit] = useState(null);
  const [courtEditFormData, setCourtEditFormData] = useState({});
  const [userEditFormData, setUserEditFormData] = useState({});
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userDateSort, setUserDateSort] = useState("ASC");

  const userEdit = (user) => {
    if (userToEdit === user.id) {
      setUserToEdit(null);
    } else {
      setUserToEdit(user.id);
      setUserEditFormData(user);
    }
  };

  const courtEdit = (court) => {
    if (court.id === courtToEdit) {
      setCourtToEdit(null);
    } else {
      setCourtToEdit(court.id);
      setCourtEditFormData(court);
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
            name: courtEditFormData.name,
            surface: courtEditFormData.surface,
            isBlocked: courtEditFormData.isBlocked,
            blockReason: courtEditFormData.blockReason,
          }),
        },
      );
      if (response.ok) {
        alert("Kort został zaktualizowany!");
        setRefreshCourts((prev) => prev + 1);
        setCourtToEdit(null);
        setCourtEditFormData({});
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

  const handleSaveUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5005/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: userEditFormData.firstName,
          lastName: userEditFormData.lastName,
          email: userEditFormData.email,
          phone: userEditFormData.phone,
          role: userEditFormData.role,
        }),
      });
      if (response.ok) {
        alert("Uzytkownik został zaktualizowany!");
        setRefreshUsers((prev) => prev + 1);
        setUserToEdit(null);
        setUserEditFormData({});
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd serwera.");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5005/api/user/${userId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Uzytkownik został usunięty!");
        setRefreshUsers((prev) => prev + 1);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd serwera.");
    }
  };

  const toggleSort = () => {
    userDateSort === "ASC" ? setUserDateSort("DESC") : setUserDateSort("ASC");
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
                <div className="court-wrapper" key={court.id}>
                  <div className="court">
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
                          courtEdit(court);
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
                            value={courtEditFormData.name}
                            className="court-edit-text-input"
                            onChange={(e) =>
                              setCourtEditFormData({
                                ...editCourtFormData,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="court-edit-text-input-wrapper">
                          <input
                            type="text"
                            value={courtEditFormData.surface}
                            className="court-edit-text-input"
                            onChange={(e) =>
                              setCourtEditFormData({
                                ...courtEditFormData,
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
                              checked={courtEditFormData.isBlocked === false}
                              onChange={() =>
                                setCourtEditFormData({
                                  ...courtEditFormData,
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
                              checked={courtEditFormData.isBlocked === true}
                              onChange={() =>
                                setCourtEditFormData({
                                  ...courtEditFormData,
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
                            value={courtEditFormData.blockReason || ""}
                            onChange={(e) =>
                              setCourtEditFormData({
                                ...courtEditFormData,
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
                  <input
                    type="text"
                    name="users__search"
                    id="users__search"
                    placeholder="Szukaj (Imię, nazwisko, telefon, e-mail)..."
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <div className="users__header-dropdown">
                  <select
                    name="users__select"
                    id="users__select"
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
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
              <h3 onClick={() => toggleSort()}>
                Dołączył(a)
                <span className="sort-icon">
                  {userDateSort === "DESC" ? "▼" : "▲"}
                </span>
              </h3>
              <h3>Akcje</h3>
            </div>
            {users
              .sort((a, b) =>
                userDateSort === "DESC"
                  ? new Date(b.createdAt) - new Date(a.createdAt)
                  : new Date(a.createdAt) - new Date(b.createdAt),
              )
              .filter((user) => {
                const userFilter =
                  `${user.firstName} ${user.lastName} ${user.email} ${user.phone}`.toLowerCase();
                return (
                  userFilter.includes(userSearch.toLowerCase()) &&
                  (userRoleFilter === "all" || userRoleFilter === user.role)
                );
              })
              .map((user, index) => {
                const roleOptions = ["USER", "RECEPTIONIST", "ADMIN"];
                return (
                  <div className="users__list-wrapper" key={user.id}>
                    <div className="users__list-user">
                      <div className="user__info">{user.firstName}</div>
                      <div className="user__info">{user.lastName}</div>
                      <div className="user__info">{user.email}</div>
                      <div className="user__info">{user.phone}</div>
                      <div className="user__info">{user.role}</div>
                      <div className="user__info">
                        {user.createdAt.split("T")[0]}
                      </div>
                      <div className="user__actions">
                        <button
                          className="user__actions-button-edit"
                          type="button"
                          onClick={() => userEdit(user)}
                        >
                          <img src={edit} alt="Edytuj" className="edit-icon" />
                          Edytuj
                        </button>
                        {user.role !== "ADMIN" && (
                          <button
                            className="user__actions-button-delete"
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <img src={bin} alt="Usuń" className="delete-icon" />
                            Usuń
                          </button>
                        )}
                      </div>
                    </div>
                    {userToEdit === user.id && (
                      <div className="users__list-edit">
                        <div className="user-edit-text-input-wrapper first-name">
                          <input
                            type="text"
                            placeholder="Imię"
                            className="user-edit-text-input"
                            value={userEditFormData.firstName}
                            onChange={(e) =>
                              setUserEditFormData({
                                ...userEditFormData,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="user-edit-text-input-wrapper last-name">
                          <input
                            type="text"
                            placeholder="Nazwisko"
                            className="user-edit-text-input"
                            value={userEditFormData.lastName}
                            onChange={(e) =>
                              setUserEditFormData({
                                ...userEditFormData,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="user-edit-text-input-wrapper email">
                          <input
                            type="text"
                            placeholder="E-mail"
                            className="user-edit-text-input"
                            value={userEditFormData.email}
                            onChange={(e) =>
                              setUserEditFormData({
                                ...userEditFormData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="user-edit-text-input-wrapper phone">
                          <input
                            type="text"
                            placeholder="Telefon"
                            className="user-edit-text-input"
                            value={userEditFormData.phone}
                            onChange={(e) =>
                              setUserEditFormData({
                                ...userEditFormData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="user-edit-select-wrapper">
                          <select
                            value={userEditFormData.role}
                            className="user-edit-select"
                            onChange={(e) =>
                              setUserEditFormData({
                                ...userEditFormData,
                                role: e.target.value,
                              })
                            }
                            disabled={userEditFormData.role === "GUEST"}
                          >
                            <option value={userEditFormData.role}>
                              {userEditFormData.role}
                            </option>{" "}
                            {roleOptions
                              .filter((role) => role !== userEditFormData.role)
                              .map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                          </select>{" "}
                          {userEditFormData.role === "GUEST" && (
                            <span>Zmiana roli gościa niemozliwa</span>
                          )}
                        </div>
                        <div className="user-edit-button-wrapper">
                          <button
                            type="button"
                            className="user-edit-button-save"
                            onClick={() => handleSaveUser(user.id)}
                          >
                            Zapisz
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
