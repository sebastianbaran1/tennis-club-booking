import { Link } from "react-router-dom";

export default function UserNavigation({ user, onLogout, closeMenu }) {
  return (
    <div className="header__right">
      {user && (
        <>
          <Link to="/kalendarz" className="header__link" onClick={closeMenu}>
            Kalendarz
          </Link>
          <Link to="/profil" className="header__link" onClick={closeMenu}>
            Moje Konto
          </Link>
        </>
      )}

      <button
        className="header__button header__button-logout"
        onClick={onLogout}
      >
        Wyloguj się
      </button>
    </div>
  );
}
