import { Link } from "react-router-dom";
import "./Header.css";

export default function Header({
  user,
  onLogout,
  onLoginOpen,
  onRegisterOpen,
}) {
  return (
    <header className="header">
      <div className="header__container">
        {user ? (
          <div className="header__user-menu">
            <span className="header__welcome">Cześć, {user.firstName}!</span>
            <span className="header__divider"> | </span>

            <Link to="/kalendarz" className="header__link">
              Kalendarz
            </Link>
            <Link to="/profil" className="header__link">
              Moje Konto
            </Link>

            <button
              className="header__button header__button--logout"
              onClick={onLogout}
            >
              Wyloguj się
            </button>
          </div>
        ) : (
          <div className="header__auth">
            <button className="header__button" onClick={onLoginOpen}>
              Zaloguj się
            </button>
            <span className="header__divider"> | </span>
            <button
              className="header__button header__button--register"
              onClick={onRegisterOpen}
            >
              Dołącz teraz
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
