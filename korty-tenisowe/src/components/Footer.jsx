import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../assets/logo.png";
import instagram from "../assets/instagram.png";
import facebook from "../assets/facebook.png";
import linkedin from "../assets/linkedin.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo-wrapper">
              <img src={logo} alt="logo" className="footer__logo" />
            </div>
            <h2 className="footer__name">
              <span className="footer__name-1">Rzeszów</span>
              <span className="footer__name-2">Tenis Klub</span>
            </h2>
          </div>

          <div className="footer__nav">
            <ul className="footer__menu">
              <li className="footer__menu-item">
                <Link to="/" className="footer__link">
                  Kariera
                </Link>
              </li>
              <li className="footer__menu-item">
                <Link to="/" className="footer__link">
                  Członkostwo
                </Link>
              </li>
              <li className="footer__menu-item">
                <Link to="/" className="footer__link">
                  Kontakt
                </Link>
              </li>
              <li className="footer__menu-item">
                <Link to="/" className="footer__link">
                  Regulamin
                </Link>
              </li>
              <li className="footer__menu-item">
                <Link to="/" className="footer__link">
                  Polityka prywatności
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer__socials">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              <img src={instagram} alt="Instagram" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              <img src={facebook} alt="Facebook" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              <img src={linkedin} alt="LinkedIn" />
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} Rzeszów Tenis Klub | ul. Korty Tenisowe
            1, 35-000 Rzeszów
          </p>
        </div>
      </div>
    </footer>
  );
}
