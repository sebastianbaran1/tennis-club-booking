import { useEffect, useState } from "react";
import "./AuthModal.css";

export default function AuthModal({
  isOpen,
  type,
  onClose,
  onSubmit,
  onChange,
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    onSubmit({
      email: "admin@admin.pl",
      password: "admin",
    });
  };

  useEffect(() => {
    if (!isOpen)
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
      });
  }, [isOpen]);

  const isLogin = type === "login";

  return (
    <div className={`modal-overlay ${isOpen ? "active" : ""}`}>
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

          {isLogin && (
            <button
              type="button"
              className="modal__submit demo-button"
              onClick={handleDemoLogin}
            >
              Użyj konta testowego
            </button>
          )}

          <div className="modal__form-subtitle">
            {isLogin ? "Nie masz jeszcze konta? " : "Masz już konto? "}
            <span className="modal__form-subtitle-action" onClick={onChange}>
              {isLogin ? "Zarejestruj się" : "Zaloguj się"}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
