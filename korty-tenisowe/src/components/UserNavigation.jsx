import { Link } from "react-router-dom";

export default function UserNavigation({ onLogout }) {
  return (
    <div className="header__right">
      <Link to="/kalendarz" className="header__link">
        Kalendarz
      </Link>
      <Link to="/profil" className="header__link">
        Moje Konto
      </Link>

      <button
        className="header__button header__button-logout"
        onClick={onLogout}
      >
        Wyloguj się
      </button>
    </div>
  );
}
