import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import "./Modal.css";
export default function BookingModal({
  bookingModal,
  setBookingModal,
  courts,
  selectedDate,
  isStaff,
  todaySchedule,
  timeToMinutes,
  setRefresh,
  isUsersLoading,
  clientList,
  reservations,
}) {
  const { user, setAlertMessage } = useOutletContext();
  const [staffTab, setStaffTab] = useState("existing");
  const [searchClient, setSearchClient] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [bookingDuration, setBookingDuration] = useState(60);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const confirmBooking = async (e) => {
    e.preventDefault();

    const { courtId, startTime } = bookingModal;
    const userId =
      staffTab === "existing" ? (selectedClientId ?? user.id) : null;

    if (isStaffSelectionInvalid) {
      setAlertMessage("Wybierz klienta z rozwijanej listy!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reservations`,
        {
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
        },
      );
      const data = await response.json();
      if (response.ok) {
        handleClose();
        setSelectedClientId(null);
        setRefresh((prev) => prev + 1);
      } else {
        setAlertMessage(data.error);
      }
    } catch (error) {
      setAlertMessage("Błąd połączenia z serwerem.");
    }
  };

  const isStaffSelectionInvalid =
    isStaff && staffTab === "existing" && !selectedClientId;

  const filteredClients = useMemo(() => {
    if (searchClient === "") return [];

    return clientList.filter((client) => {
      const fullName =
        `${client.firstName} ${client.lastName} ${client.phone}`.toLowerCase();
      return fullName.includes(searchClient.toLowerCase());
    });
  }, [searchClient, clientList]);

  const is90MinAvailable = useMemo(() => {
    if (bookingModal.isOpen && todaySchedule.close) {
      const futureReservations = reservations.filter(
        (res) =>
          res.courtId === bookingModal.courtId &&
          timeToMinutes(res.startTime) > timeToMinutes(bookingModal.startTime),
      );

      const isCollision = futureReservations.some(
        (res) =>
          timeToMinutes(bookingModal.startTime) + 90 >
          timeToMinutes(res.startTime),
      );

      const closingTime = timeToMinutes(todaySchedule.close);
      const startTime = timeToMinutes(bookingModal.startTime);
      return closingTime - startTime >= 90 && !isCollision;
    }
    return false;
  }, [bookingModal, todaySchedule.close, reservations, timeToMinutes]);

  const handleReset = () => {
    setSearchClient("");
    setNewClient({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    });
    setSelectedClientId(null);
  };
  const handleClose = () => {
    setBookingModal({
      isOpen: false,
      courtId: null,
      startTime: null,
    });
  };

  useEffect(() => {
    handleReset();
    setIsDropdownOpen(true);
    setBookingDuration(60);
  }, [bookingModal.isOpen]);

  return (
    <div className="modal-overlay active" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={handleClose}>
          ✕
        </button>
        <h2 className="modal__title">Potwierdź rezerwację</h2>
        <p className="modal__subtitle">
          Rezerwujesz{" "}
          <span className="booking-modal__court-highlight">
            {courts.find((c) => c.id === bookingModal.courtId)?.name}
          </span>{" "}
          od{" "}
          <span className="booking-modal__time-highlight">
            {bookingModal.startTime}
          </span>{" "}
          ({selectedDate}).
        </p>
        <form className="modal__form" onSubmit={confirmBooking}>
          {isStaff && (
            <div className="booking-modal__form-staff">
              <div className="booking-modal__form-buttons">
                <button
                  type="button"
                  className={`staff-tabs ${staffTab === "existing" ? "active" : ""}`}
                  onClick={() => {
                    setStaffTab("existing");
                    handleReset();
                  }}
                >
                  Klient z bazy
                </button>
                <button
                  type="button"
                  className={`staff-tabs ${staffTab === "new" ? "active" : ""}`}
                  onClick={() => {
                    setStaffTab("new");
                    handleReset();
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
                        handleReset();
                        setIsDropdownOpen(true);
                      }}
                      autoComplete="off"
                    />
                    {isDropdownOpen === true && (
                      <div className="staff-dropdown-wrapper">
                        {isUsersLoading ? (
                          <div>Wczytywanie użytkowników...</div>
                        ) : (
                          <ul className="staff-dropdown-list">
                            {filteredClients.map((client) => (
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
                            {searchClient !== "" &&
                              filteredClients.length === 0 && (
                                <li className="dropdown-empty">Brak wyników</li>
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
                      autoComplete="off"
                    />
                  </div>
                  <div className="tabs-new-client">
                    <label htmlFor="new-client-input-lastname">Nazwisko</label>
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
                      autoComplete="off"
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
                      autoComplete="off"
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
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="booking-modal__form-group">
            <label className="booking-modal__form-label">
              Czas trwania gry:
            </label>
            <div className="booking-modal__radio-group">
              <label className="booking-modal__radio-label">
                <input
                  type="radio"
                  value={60}
                  checked={bookingDuration === 60}
                  onChange={() => setBookingDuration(60)}
                />
                60 minut
              </label>
              {is90MinAvailable && (
                <label className="booking-modal__radio-label">
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

          <button type="submit" className="modal__submit">
            {isStaff ? "Zarezerwuj" : "Zarezerwuj i graj!"}
          </button>
        </form>
      </div>
    </div>
  );
}
