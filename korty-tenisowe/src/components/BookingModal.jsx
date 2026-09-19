import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

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
}) {
  const { user } = useOutletContext();
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

  const isStaffSelectionInvalid =
    isStaff && staffTab === "existing" && !selectedClientId;

  const filteredClients =
    searchClient !== ""
      ? clientList.filter((client) => {
          const fullName =
            `${client.firstName} ${client.lastName} ${client.phone}`.toLowerCase();
          return fullName.includes(searchClient.toLowerCase());
        })
      : [];

  let is90MinAvailable = false;

  if (bookingModal.isOpen && todaySchedule.close) {
    const closingTime = timeToMinutes(todaySchedule.close);
    const startTime = timeToMinutes(bookingModal.startTime);
    is90MinAvailable = closingTime - startTime >= 90;
  }

  useEffect(() => {
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
  }, [bookingModal.isOpen]);

  return (
    <div
      className="booking-modal-overlay active"
      onClick={() =>
        setBookingModal({
          isOpen: false,
          courtId: null,
          startTime: null,
        })
      }
    >
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="booking-modal__close"
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
        <h2 className="booking-modal__title">Potwierdź rezerwację</h2>
        <p className="booking-modal__subtitle">
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
        <form className="booking-modal__form" onSubmit={confirmBooking}>
          {isStaff && (
            <div className="booking-modal__form-staff">
              <div className="booking-modal__form-buttons">
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

          <button type="submit" className="booking-modal__submit">
            {isStaff ? "Zarezerwuj" : "Zarezerwuj i graj!"}
          </button>
        </form>
      </div>
    </div>
  );
}
