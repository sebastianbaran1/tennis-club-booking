import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserNavigation from "./UserNavigation";
import "./Navbar.css";
import logo from "../assets/logo.png";

export default function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  let offset = 0;
  if (user) {
    user.role === "ADMIN" || user.role === "DEMO_ADMIN"
      ? (offset = 3)
      : (offset = 2);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);

  return (
    <nav className="nav">
      <div className="nav__container">
        <Link to="/">
          <div className="nav__brand">
            <img src={logo} alt="logo" className="nav__logo" />
            <div className="nav__name-container">
              <span className="nav__name-1">Klub Tenisowy </span>
              <span className="nav__name-2">Rzeszów</span>
            </div>
          </div>
        </Link>

        <button
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Otwórz menu"
        >
          <span className="hamburger__bar"></span>
          <span className="hamburger__bar"></span>
          <span className="hamburger__bar"></span>
        </button>

        <ul className={`nav__menu ${isOpen ? "active" : ""}`}>
          <UserNavigation
            user={user}
            onLogout={onLogout}
            closeMenu={closeMenu}
          />

          <li
            className="nav__menu-separator"
            style={{ "--i": 0.5 + offset }}
          ></li>
          <li className="nav__menu-item" style={{ "--i": 1 + offset }}>
            <Link to="/" className="nav__menu-item-link" onClick={closeMenu}>
              Strona główna
            </Link>
          </li>
          <li className="nav__menu-item" style={{ "--i": 2 + offset }}>
            <Link
              to="/o-nas"
              className="nav__menu-item-link"
              onClick={closeMenu}
            >
              O nas
            </Link>
          </li>
          <li className="nav__menu-item" style={{ "--i": 3 + offset }}>
            <Link
              to="/czlonkostwo"
              className="nav__menu-item-link"
              onClick={closeMenu}
            >
              Członkostwo
            </Link>
          </li>
          <li className="nav__menu-item" style={{ "--i": offset + 4 }}>
            <Link
              to="/wydarzenia"
              className="nav__menu-item-link"
              onClick={closeMenu}
            >
              Wydarzenia
            </Link>
          </li>
          <li className="nav__menu-item" style={{ "--i": 5 + offset }}>
            <Link
              to="/kontakt"
              className="nav__menu-item-link"
              onClick={closeMenu}
            >
              Kontakt
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
