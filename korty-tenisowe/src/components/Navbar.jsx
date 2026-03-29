import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav__container">
        <div className="nav__brand">
          <img src={logo} alt="logo" className="nav__logo" />
          <span className="nav__name">Klub Tenisowy Rzeszów</span>
        </div>

        <ul className="nav__menu">
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link">
              Strona główna
            </Link>
          </li>
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link">
              O nas
            </Link>
          </li>
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link">
              Członkostwo
            </Link>
          </li>
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link">
              Wydarzenia
            </Link>
          </li>
          <li className="nav__menu-item">
            <Link to="/" className="nav__menu-item-link">
              Kontakt
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
