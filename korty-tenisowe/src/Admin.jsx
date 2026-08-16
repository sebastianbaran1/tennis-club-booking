import { useState, useEffect, useRef } from "react";
import "./Admin.css";
import bin from "./assets/bin.png";
import edit from "./assets/edit.png";
import clock from "./assets/clock.png";
const daysOrder = [1, 2, 3, 4, 5, 6, 0];

const timeSlots = [];

for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    let hourStr = h.toString().padStart(2, "0");
    let minStr = m.toString().padStart(2, "0");
    timeSlots.push(`${hourStr}:${minStr}`);
  }
}

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

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    type: null,
    title: "",
    name: "",
  });

  const [refreshCourts, setRefreshCourts] = useState(0);
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [courtToEdit, setCourtToEdit] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [courtEditFormData, setCourtEditFormData] = useState({});
  const [userEditFormData, setUserEditFormData] = useState({});
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userDateSort, setUserDateSort] = useState("ASC");
  const [activeTab, setActiveTab] = useState("weekly");
  const [newClosedDay, setNewClosedDay] = useState("");
  const [closedDays, setClosedDays] = useState([]);
  const [slotToOpen, setSlotToOpen] = useState({ key: null, type: null });
  const selectedTimeRef = useRef(null);

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

  const isScheduleValid = (openString, closeString) => {
    return timeToMinutes(closeString) - timeToMinutes(openString) > 0;
  };

  const timeToMinutes = (timeString) => {
    if (timeString === "00:00") return 24 * 60;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleSubmitSchedule = async () => {
    for (let i = 0; i <= 6; i++) {
      if (isScheduleValid(schedule[i].open, schedule[i].close) === false) {
        alert("Godzina zamknięcia musi być późniejsza niż godzina otwarcia!");
        return;
      }
    }

    try {
      const response = await fetch(
        "http://localhost:5005/api/settings/schedule",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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

  const handleSubmitExceptions = async () => {
    try {
      const response = await fetch(
        "http://localhost:5005/api/settings/exceptions",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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

  const handleOpenModal = (id, type, name) => {
    setDeleteModal({
      isOpen: true,
      id: id,
      type: type,
      title: type === "court" ? "Usuwanie kortu" : "Usuwanie uzytkownika",
      name: name,
    });
  };
  const handleCloseModal = () => {
    setDeleteModal({
      isOpen: false,
      id: null,
      type: null,
      title: "",
      name: "",
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.type === "court") {
      await handleDeleteCourt(deleteModal.id);
    } else {
      await handleDeleteUser(deleteModal.id);
    }
    handleCloseModal();
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

  const toggleSort = () => {
    userDateSort === "ASC" ? setUserDateSort("DESC") : setUserDateSort("ASC");
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          "http://localhost:5005/api/settings/schedule",
        );
        const data = await response.json();
        if (response.ok) {
          setSchedule(data);
        }
      } catch (error) {
        alert("Błąd połączenia z serwerem.");
      }
    };
    fetchSchedule();
  }, []);

  useEffect(() => {
    const fetchExceptions = async () => {
      try {
        const response = await fetch(
          "http://localhost:5005/api/settings/exceptions",
        );
        const data = await response.json();
        if (response.ok) {
          setClosedDays(data);
        }
      } catch (error) {
        alert("Błąd połączenia z serwerem.");
      }
    };
    fetchExceptions();
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

  return (
    <div className="admin-container">
      <h1 className="admin__header">Panel administratora</h1>
      <div className="admin__content-container">
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
            <div className="courts__list-header">
              <h3>Nazwa Kortu</h3>
              <h3>Nawierzchnia</h3>
              <h3>Status</h3>
              <h3>Akcje</h3>
            </div>
            <div className="courts__list">
              {courts.map((court, index) => (
                <div className="court-wrapper" key={court.id}>
                  <div className="court">
                    <div className="court__info">
                      <span className="mobile-label">Nazwa Kortu</span>
                      {court.name}
                    </div>

                    <div className="court__info">
                      {" "}
                      <span className="mobile-label">Nazwierzchnia</span>
                      {court.surface}
                    </div>
                    <div
                      className={`court__info-status ${court.isBlocked === false ? "available" : "blocked"}`}
                    >
                      <span className="mobile-label">Status</span>
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
                      <span className="mobile-label">Akcje</span>
                      <div className="court__actions-buttons">
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
                          onClick={() =>
                            handleOpenModal(
                              court.id,
                              "court",
                              `${court.name} ${court.surface}`,
                            )
                          }
                        >
                          <img src={bin} alt="Usuń" className="delete-icon" />
                          Usuń
                        </button>
                      </div>
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
                                ...courtEditFormData,
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
                              onChange={() => {
                                setCourtEditFormData({
                                  ...courtEditFormData,
                                  isBlocked: false,
                                  blockReason: "",
                                });
                              }}
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
            <div className="users__list-wrapper">
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
                    <div className="users__list-user-wrapper" key={user.id}>
                      <div className="users__list-user">
                        <div className="user__info">
                          <span className="mobile-label">Imię</span>
                          {user.firstName}
                        </div>
                        <div className="user__info">
                          <span className="mobile-label">Nazwisko</span>
                          {user.lastName}
                        </div>
                        <div className="user__info">
                          <span className="mobile-label">E-mail</span>
                          {user.email}
                        </div>
                        <div className="user__info">
                          <span className="mobile-label">Telefon</span>
                          {user.phone}
                        </div>
                        <div className="user__info">
                          <span className="mobile-label">Rola</span>
                          {user.role}
                        </div>
                        <div className="user__info">
                          <span className="mobile-label">Dołączył(a)</span>
                          {user.createdAt.split("T")[0]}
                        </div>
                        <div className="user__actions">
                          <span className="mobile-label">Akcje</span>
                          <div className="user__actions-buttons">
                            <button
                              className="user__actions-button-edit"
                              type="button"
                              onClick={() => userEdit(user)}
                            >
                              <img
                                src={edit}
                                alt="Edytuj"
                                className="edit-icon"
                              />
                              {user.id === userToEdit ? "Anuluj" : "Edytuj"}
                            </button>
                            {user.role !== "ADMIN" && (
                              <button
                                className="user__actions-button-delete"
                                type="button"
                                onClick={() =>
                                  handleOpenModal(
                                    user.id,
                                    "user",
                                    `${user.firstName} ${user.lastName}`,
                                  )
                                }
                              >
                                <img
                                  src={bin}
                                  alt="Usuń"
                                  className="delete-icon"
                                />
                                Usuń
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {userToEdit === user.id && (
                        <div
                          className={`users__list-edit ${userEditFormData.role === "GUEST" ? "guest" : ""}`}
                        >
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
                                .filter(
                                  (role) => role !== userEditFormData.role,
                                )
                                .map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                            </select>
                            {userEditFormData.role === "GUEST" && (
                              <div>Zmiana roli gościa niemozliwa</div>
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
      {deleteModal.isOpen && (
        <div className="modal-overlay active">
          <div className="modal">
            <button
              className="modal__close"
              onClick={() =>
                setDeleteModal({
                  isOpen: false,
                  id: null,
                  type: null,
                })
              }
            >
              ✕
            </button>
            <h2 className="modal__title">{deleteModal.title}</h2>
            <p className="modal__subtitle">
              Czy na pewno chcesz usunąć:{" "}
              <span className="modal__subtitle-highlight">
                {deleteModal.name}
              </span>
              ? <br />
              Tej operacji nie można cofnąć.
            </p>

            <div className="modal__buttons">
              <button
                className="modal__button-cancel"
                onClick={() => handleCloseModal()}
              >
                Anuluj
              </button>
              <button
                className="modal__button-confirm"
                onClick={() => handleConfirmDelete()}
              >
                Usuń {deleteModal.type === "user" ? "użytkownika" : "kort"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
