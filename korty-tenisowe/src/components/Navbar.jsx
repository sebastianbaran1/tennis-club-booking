import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="nav">
      <div className="nav__container">
        <div className="nav__brand">
          <img src={logo} alt="logo" className="nav__logo" />
          <div className="nav__name-container">
            <span className="nav__name-1">Klub Tenisowy </span>
            <span className="nav__name-2">Rzeszów</span>
          </div>
        </div>

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
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link" onClick={closeMenu}>
              Strona główna
            </Link>
          </li>
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link" onClick={closeMenu}>
              O nas
            </Link>
          </li>
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link" onClick={closeMenu}>
              Członkostwo
            </Link>
          </li>
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link" onClick={closeMenu}>
              Wydarzenia
            </Link>
          </li>
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link" onClick={closeMenu}>
              Kontakt
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
