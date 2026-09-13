import { useState, useEffect, useMemo } from "react";
import DeleteModal from "./DeleteModal";
import bin from "../assets/bin.png";
import edit from "../assets/edit.png";

export default function AdminUsers() {
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      createdAt: "",
    },
  ]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userDateSort, setUserDateSort] = useState("ASC");
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userEditFormData, setUserEditFormData] = useState({});
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [error, setError] = useState(null);

  const toggleSort = () => {
    userDateSort === "ASC" ? setUserDateSort("DESC") : setUserDateSort("ASC");
  };

  const userEdit = (user) => {
    if (userToEdit === user.id) {
      setUserToEdit(null);
    } else {
      setUserToEdit(user.id);
      setUserEditFormData(user);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5005/api/user/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSaveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5005/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  const filteredUsers = useMemo(() => {
    return [...users]
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
      });
  }, [userDateSort, userSearch, users, userRoleFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5005/api/usersAdmin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
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
  }, [refreshUsers]);

  if (error) {
    return (
      <div className="admin-error">
        <h2>Ups, coś poszło nie tak!</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
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
          {isUsersLoading ? (
            <div>Ładowanie użytkowników...</div>
          ) : (
            <>
              {filteredUsers.map((user, index) => {
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
                                setItemToDelete({
                                  title: "Usuwanie użytkownika",
                                  name: `${user.firstName} ${user.lastName}`,
                                  buttonText: "Usuń użytkownika",
                                  action: () => handleDeleteUser(user.id),
                                })
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
                            </option>
                            {roleOptions
                              .filter((role) => role !== userEditFormData.role)
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
