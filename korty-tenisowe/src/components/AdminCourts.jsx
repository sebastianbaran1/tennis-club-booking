import { useState, useEffect } from "react";
import DeleteModal from "./DeleteModal";
import bin from "../assets/bin.png";
import edit from "../assets/edit.png";

export default function AdminCourts() {
  const [refreshCourts, setRefreshCourts] = useState(0);
  const [isCourtsLoading, setIsCourtsLoading] = useState(true);
  const [courts, setCourts] = useState([
    {
      id: 1,
      name: "Kort 1",
      surface: "Mączka",
      isBlocked: false,
      blockReason: "",
    },
  ]);
  const [courtToEdit, setCourtToEdit] = useState(null);
  const [courtEditFormData, setCourtEditFormData] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);
  const [error, setError] = useState(null);

  const courtEdit = (court) => {
    if (court.id === courtToEdit) {
      setCourtToEdit(null);
    } else {
      setCourtToEdit(court.id);
      setCourtEditFormData(court);
    }
  };

  const handleAddCourt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5005/api/courts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  const handleDeleteCourt = async (courtId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5005/api/courts/${courtId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSaveCourt = async (courtId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5005/api/courts/${courtId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await fetch("http://localhost:5005/api/courts");
        const data = await response.json();
        if (response.ok) {
          setCourts(data.courts);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Błąd połączenia z serwerem.");
      } finally {
        setIsCourtsLoading(false);
      }
    };
    fetchCourts();
  }, [refreshCourts]);

  if (error) {
    return (
      <div className="admin-error">
        <h2>Ups, coś poszło nie tak!</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
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
            <span className="courts__button-add-plus">+</span> DODAJ NOWY KORT
          </button>
        </div>
        <div className="courts__list-header">
          <h3>Nazwa Kortu</h3>
          <h3>Nawierzchnia</h3>
          <h3>Status</h3>
          <h3>Akcje</h3>
        </div>
        <div className="courts__list">
          {isCourtsLoading ? (
            <div>Ładowanie kortów...</div>
          ) : (
            <>
              {courts.map((court, index) => (
                <div className="court-wrapper" key={court.id}>
                  <div className="court">
                    <div className="court__info">
                      <span className="mobile-label">Nazwa Kortu</span>
                      {court.name}
                    </div>

                    <div className="court__info">
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
                            setItemToDelete({
                              title: "Usuwanie kortu",
                              name: `${court.name} ${court.surface}`,
                              buttonText: "Usuń kort",
                              action: () => handleDeleteCourt(court.id),
                            })
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
                            />
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
                            />
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
            </>
          )}
        </div>
      </div>

      {itemToDelete && (
        <DeleteModal
          title={itemToDelete.title}
          name={itemToDelete.name}
          buttonText={itemToDelete.buttonText}
          handleDelete={itemToDelete.action}
          onClose={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}
