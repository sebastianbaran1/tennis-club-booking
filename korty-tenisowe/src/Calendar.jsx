import { useOutletContext, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Calendar.css";

const timeToMinutes = (timeString) => {
  if (!timeString || typeof timeString !== "string" || timeString === "--:--") {
    return 0;
  }
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function Calendar() {
  const { user, isUserLoading } = useOutletContext();
  const [courts, setCourts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const todayStr = new Date().toLocaleDateString("en-CA");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedCourtIndex, setSelectedCourtIndex] = useState(0);
  const [courtsPerPage, setCourtsPerPage] = useState(4);
  const [staffTab, setStaffTab] = useState("existing");
  const [searchClient, setSearchClient] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [clientList, setClientList] = useState([]);
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    courtId: null,
    startTime: null,
  });
  const [bookingDuration, setBookingDuration] = useState(60);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isReservationsLoading, setIsReservationsLoading] = useState(true);
  const [isStaticDataLoading, setIsStaticDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const isStaff = ["ADMIN", "RECEPTIONIST", "DEMO_ADMIN"].includes(user?.role);
  const todaySchedule = schedule[new Date(selectedDate).getDay()];

  const generateTimeSlots = () => {
    if (!schedule || schedule.length === 0) return [];

    if (
      !todaySchedule ||
      !todaySchedule.open ||
      !todaySchedule.close ||
      (todaySchedule.open === "--:--" && todaySchedule.close === "--:--")
    )
      return [];

    const [openHour, openMinute] = todaySchedule.open.split(":").map(Number);
    const [closeHour, closeMinute] = todaySchedule.close.split(":").map(Number);

    const startSlot = openHour * 2 + (openMinute === 30 ? 1 : 0);
    const closeSlot = closeHour * 2 + (closeMinute === 30 ? 1 : 0);

    const slots = [];
    for (let h = startSlot; h <= closeSlot; h++) {
      const hourStr = Math.floor(h / 2)
        .toString()
        .padStart(2, "0");
      const minStr = h % 2 === 0 ? "00" : "30";

      slots.push(`${hourStr}:${minStr}`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const isPastSlot = (slotTime) => {
    if (selectedDate < todayStr) return true;
    if (selectedDate > todayStr) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return timeToMinutes(slotTime) <= currentMinutes;
  };

  const isTooLate = (slotTime) => {
    if (!schedule || schedule.length === 0) return true;
    if (!todaySchedule || !todaySchedule.close) return true;
    return timeToMinutes(todaySchedule.close) - timeToMinutes(slotTime) < 60;
  };

  let is90MinAvailable = false;
  if (bookingModal.isOpen && todaySchedule && todaySchedule.close) {
    const closingTime = timeToMinutes(todaySchedule.close);
    const startTime = timeToMinutes(bookingModal.startTime);
    is90MinAvailable = closingTime - startTime >= 90;
  }

  const isBlocked = (courtId) => {
    return courts.some(
      (court) => court.id === courtId && court.isBlocked === true,
    );
  };

  const isClubClosedToday =
    exceptions.includes(selectedDate) ||
    (todaySchedule?.open === "--:--" && todaySchedule?.close === "--:--");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 425) {
        setCourtsPerPage(1);
      } else if (width >= 425 && width < 768) {
        setCourtsPerPage(2);
      } else {
        setCourtsPerPage(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isStaff) {
      setIsUsersLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5005/api/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setClientList(data.users);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Błąd połączenia z serwerem.");
      } finally {
        setIsUsersLoading(false);
      }
    };
    fetchUsers();
  }, [user?.role]);

  useEffect(() => {
    if (!courtsPerPage) return;

    setSelectedCourtIndex((prev) => {
      return Math.floor(prev / courtsPerPage) * courtsPerPage;
    });
  }, [courtsPerPage]);

  useEffect(() => {
    if (!user || isUserLoading) return;

    const fetchReservationsData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5005/api/reservations?date=${selectedDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();

        if (response.ok) {
          setReservations(data.reservations);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Błąd połączenia z serwerem.");
      } finally {
        setIsReservationsLoading(false);
      }
    };
    fetchReservationsData();
  }, [selectedDate, refresh, user, isUserLoading]);

  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [courtsRes, exceptionsRes, scheduleRes] = await Promise.all([
          fetch("http://localhost:5005/api/courts"),
          fetch("http://localhost:5005/api/settings/exceptions"),
          fetch("http://localhost:5005/api/settings/schedule"),
        ]);
        const [courtsData, exceptionsData, scheduleData] = await Promise.all([
          courtsRes.json(),
          exceptionsRes.json(),
          scheduleRes.json(),
        ]);
        if (courtsRes.ok && exceptionsRes.ok && scheduleRes.ok) {
          setCourts(courtsData.courts);
          setExceptions(exceptionsData.exceptions);
          setSchedule(scheduleData.schedule);
        } else {
          setError(
            courtsData.error || exceptionsData.error || scheduleData.error,
          );
        }
      } catch (error) {
        setError("Błąd połączenia z serwerem.");
      }
      setIsStaticDataLoading(false);
    };
    fetchStaticData();
  }, []);

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

  if (isReservationsLoading || isStaticDataLoading) {
    return (
      <div className="profile-loading">
        <h2>Wczytywanie rezerwacji...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-error">
        <h2>Ups, coś poszło nie tak!</h2>
        <p>{error}</p>
      </div>
    );
  }

  const handleOpenBookingModal = (courtId, startTime) => {
    setBookingModal({ isOpen: true, courtId, startTime });
    setSearchClient("");
    setNewClient({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    });
    setIsDropdownOpen(true);
    setSelectedClientId(null);
    setBookingDuration(60);
  };

  const confirmBooking = async (e) => {
    e.preventDefault();

    const { courtId, startTime } = bookingModal;
    const userId =
      staffTab === "existing" ? (selectedClientId ?? user.id) : null;

    if (isStaffSelectionInvalid) {
      alert("Wybierz klienta z rozwijanej listy!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5005/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courtId,
          date: selectedDate,
          startTime,
          duration: bookingDuration,
          userId,
          newClient,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setBookingModal({ isOpen: false, courtId: null, startTime: null });
        setSelectedClientId(null);
        setRefresh((prev) => prev + 1);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd połączenia z serwerem.");
    }
  };

  const handleCancelReservation = async (reservationId) => {
    const confirm = window.confirm(
      "Czy na pewno chcesz odwołać tę rezerwację?",
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5005/api/reservations/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setRefresh((prev) => prev + 1);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Błąd serwera.");
    }
  };

  const getRowIndex = (time) => {
    const startMin = timeToMinutes(
      schedule[new Date(selectedDate).getDay()].open,
    );
    return (timeToMinutes(time) - startMin) / 30 + 2;
  };

  const courtOptions = [];

  for (let i = 0; i < courts.length; i += courtsPerPage) {
    let start = i + 1;
    let end = start + courtsPerPage - 1;
    if (end > courts.length) {
      end = courts.length;
    }
    courtOptions.push(
      <option key={`korty-${i}`} value={i}>
        {start === end ? `Kort ${start}` : `Korty ${start} - ${end}`}
      </option>,
    );
  }

  const visibleCourts = courts.slice(
    selectedCourtIndex,
    selectedCourtIndex + courtsPerPage,
  );

  const isStaffSelectionInvalid =
    isStaff && staffTab === "existing" && !selectedClientId;

  return (
    <div className="calendar-container">
      {console.log(schedule)}
      <h1 className="calendar-title">Kalendarz Rezerwacji</h1>
      <div className="calendar-controls">
        <div className="calendar-date-wrapper">
          <label className="calendar-date-label" htmlFor="date-input">
            Wybierz dzień:{" "}
          </label>
          <input
            type="date"
            value={selectedDate}
            min={todayStr}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="calendar-date-input"
            id="date-input"
          />
        </div>

        <div className="calendar-court-wrapper">
          <label className="calendar-court-label" htmlFor="court-select">
            Wybierz korty:{" "}
          </label>
          <select
            className="calendar-court-select"
            id="court-select"
            value={selectedCourtIndex}
            onChange={(e) => setSelectedCourtIndex(Number(e.target.value))}
          >
            {courtOptions}
          </select>
        </div>
      </div>

      {isClubClosedToday ? (
        <div>Klub tenisowy nieczynny</div>
      ) : (
        <div className="calendar-grid-wrapper">
          <div
            className="calendar-grid"
            style={{ "--court-count": visibleCourts.length }}
          >
            <div
              className="grid-header grid-header-hour"
              style={{ gridRow: 1, gridColumn: 1 }}
            >
              Godzina
            </div>

            {visibleCourts?.map((court, index) => (
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
              visibleCourts?.map((court, cIndex) => {
                const past = isPastSlot(slotTime);
                const late = isTooLate(slotTime);
                const blocked = isBlocked(court.id);
                return (
                  <div
                    className={`empty-slot ${blocked ? "slot-blocked" : past ? "slot-past" : late ? "slot-late" : ""}`}
                    key={`empty-${court.id}-${slotTime}`}
                    style={{ gridRow: rIndex + 2, gridColumn: cIndex + 2 }}
                    onClick={() => {
                      !past &&
                        !late &&
                        !blocked &&
                        handleOpenBookingModal(court.id, slotTime);
                    }}
                  >
                    {blocked
                      ? `${court.blockReason}`
                      : past
                        ? "Minęło"
                        : late
                          ? "Zbyt późno"
                          : "+ Rezerwuj"}
                  </div>
                );
              }),
            )}

            {reservations
              .filter((res) => visibleCourts.some((c) => c.id === res.courtId))
              .map((res) => {
                const rowStart = getRowIndex(res.startTime);
                const rowSpan = res.duration / 30;
                const colIndex =
                  visibleCourts.findIndex((c) => c.id === res.courtId) + 2;

                const isMyRes = res.userId === user.id;
                const canCancel = isMyRes || isStaff;

                return (
                  <div
                    className={`reservation-block ${isMyRes ? "res-mine" : "res-taken"}`}
                    key={`res-${res.id}`}
                    style={{
                      gridRow: `${rowStart} / span ${rowSpan}`,
                      gridColumn: colIndex,
                      cursor: canCancel ? "pointer" : "not-allowed",
                    }}
                    onClick={() => canCancel && handleCancelReservation(res.id)}
                  >
                    <span>{isMyRes ? "Twoja gra" : "Zajęte"}</span>

                    {isStaff ? (
                      <span className="reservation-staff-details">
                        {res.user?.firstName} {res.user?.lastName} <br />
                        Nr. tel: {res.user?.phone}
                      </span>
                    ) : (
                      <span className="reservation-user-details">
                        {isMyRes && "(kliknij by usunąć)"}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {bookingModal.isOpen && (
        <div className="modal-overlay active">
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
              Rezerwujesz{" "}
              <span className="modal__court-highlight">
                {courts.find((c) => c.id === bookingModal.courtId)?.name}
              </span>{" "}
              od{" "}
              <span className="modal__time-highlight">
                {bookingModal.startTime}
              </span>{" "}
              ({selectedDate}).
            </p>
            <form className="modal__form" onSubmit={confirmBooking}>
              {isStaff && (
                <div className="modal__form-staff">
                  <div className="modal__form-buttons">
                    <button
                      type="button"
                      className={`staff-tabs ${staffTab === "existing" ? "active" : ""}`}
                      onClick={() => {
                        setStaffTab("existing");
                        setSearchClient("");
                        setSelectedClientId(null);
                        setNewClient({
                          firstName: "",
                          lastName: "",
                          phone: "",
                          email: "",
                        });
                      }}
                    >
                      Klient z bazy
                    </button>
                    <button
                      type="button"
                      className={`staff-tabs ${staffTab === "new" ? "active" : ""}`}
                      onClick={() => {
                        setStaffTab("new");
                        setSearchClient("");
                        setSelectedClientId(null);
                        setNewClient({
                          firstName: "",
                          lastName: "",
                          phone: "",
                          email: "",
                        });
                      }}
                    >
                      Nowy klient
                    </button>
                  </div>
                  {staffTab === "existing" && (
                    <div className="tabs-existing-wrapper">
                      <div className="tabs-existing-clients">
                        <label htmlFor="staff-clients-input">
                          Wyszukaj klienta
                        </label>
                        <input
                          type="text"
                          id="staff-clients-input"
                          className="staff-clients-input"
                          required
                          placeholder="Imię, nazwisko, telefon"
                          value={searchClient}
                          onChange={(e) => {
                            setSearchClient(e.target.value);
                            setIsDropdownOpen(true);
                          }}
                          onFocus={() => {
                            setSearchClient("");
                            setSelectedClientId(null);
                            setIsDropdownOpen(true);
                          }}
                        />
                        {isDropdownOpen === true && (
                          <div className="staff-dropdown-wrapper">
                            {isUsersLoading ? (
                              <div>Wczytywanie użytkowników...</div>
                            ) : (
                              <ul className="staff-dropdown-list">
                                {searchClient !== "" &&
                                  clientList
                                    .filter((client) => {
                                      const fullName =
                                        `${client.firstName} ${client.lastName} ${client.phone}`.toLowerCase();
                                      return fullName.includes(
                                        searchClient.toLowerCase(),
                                      );
                                    })
                                    .map((client) => (
                                      <li
                                        key={client.id}
                                        className="dropdown-client"
                                        onClick={() => {
                                          setSelectedClientId(client.id);
                                          setSearchClient(
                                            `${client.firstName} ${client.lastName} ${client.phone}`,
                                          );
                                          setIsDropdownOpen(false);
                                        }}
                                      >
                                        <div className="dropdown-client-info">
                                          <span>{client.firstName}</span>
                                          <span>{client.lastName}</span>
                                          <span>{client.phone}</span>
                                        </div>
                                      </li>
                                    ))}
                                {clientList.filter((client) => {
                                  const fullName =
                                    `${client.firstName} ${client.lastName} ${client.phone}`.toLowerCase();
                                  return fullName.includes(
                                    searchClient.toLowerCase(),
                                  );
                                }).length === 0 && (
                                  <li className="dropdown-empty">
                                    Brak wyników
                                  </li>
                                )}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {staffTab === "new" && (
                    <div className="tabs-new-wrapper">
                      <div className="tabs-new-client">
                        <label htmlFor="new-client-input-firstname">Imię</label>
                        <input
                          type="text"
                          id="new-client-input-firstname"
                          className="new-client-input"
                          required
                          value={newClient.firstName}
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="tabs-new-client">
                        <label htmlFor="new-client-input-lastname">
                          Nazwisko
                        </label>
                        <input
                          type="text"
                          id="new-client-input-lastname"
                          className="new-client-input"
                          required
                          value={newClient.lastName}
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="tabs-new-client">
                        <label htmlFor="new-client-input-phone">
                          Numer Telefonu
                        </label>
                        <input
                          type="tel"
                          id="new-client-input-phone"
                          className="new-client-input"
                          required
                          value={newClient.phone}
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="tabs-new-client">
                        <label htmlFor="new-client-input-email">E-mail</label>
                        <input
                          type="email"
                          id="new-client-input-email"
                          className="new-client-input"
                          required
                          value={newClient.email}
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                  {is90MinAvailable && (
                    <label className="modal__radio-label">
                      <input
                        type="radio"
                        value={90}
                        checked={bookingDuration === 90}
                        onChange={() => setBookingDuration(90)}
                      />
                      90 minut
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="modal__submit"
                onClick={(e) => {
                  if (isStaffSelectionInvalid) {
                    e.preventDefault();
                    alert("Proszę wybrać klienta z listy!");
                  }
                }}
              >
                {isStaff ? "Zarezerwuj" : "Zarezerwuj i graj!"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
