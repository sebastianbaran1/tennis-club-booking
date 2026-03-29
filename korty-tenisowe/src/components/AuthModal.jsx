import { useState } from "react";
import "./AuthModal.css";

export default function AuthModal({ isOpen, type, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isLogin = type === "login";

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal__close" onClick={onClose}>
          ✕
        </button>

        <h2 className="modal__title">
          {isLogin ? "Witaj ponownie" : "Dołącz do nas"}
        </h2>
        <p className="modal__subtitle">
          {isLogin
            ? "Zaloguj się do swojego konta"
            : "Zarejestruj się, aby rezerwować korty i brać udział w turniejach"}
        </p>

        <form className="modal__form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="firstName"
                placeholder="Imię"
                className="modal__input"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Nazwisko"
                className="modal__input"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Adres e-mail"
            className="modal__input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            className="modal__input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <input
              type="tel"
              name="phone"
              placeholder="Numer telefonu"
              className="modal__input"
              value={formData.phone}
              onChange={handleChange}
            />
          )}

          <button type="submit" className="modal__submit">
            {isLogin ? "Zaloguj się" : "Załóż konto"}
          </button>
        </form>
      </div>
    </div>
  );
}
