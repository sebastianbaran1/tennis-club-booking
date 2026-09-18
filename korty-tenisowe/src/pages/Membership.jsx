import { useOutletContext, useNavigate } from "react-router-dom";
import "./Membership.css";

export default function Membership() {
  const { user, setIsLoginOpen } = useOutletContext();
  const navigate = useNavigate();
  const handleClick = () => {
    if (!user) {
      setIsLoginOpen(true);
    } else {
      navigate("/profil");
    }
  };
  return (
    <div className="membership-page">
      <div className="membership__hero">
        <div className="membership__hero-title">Zostań częścią Klubu</div>
        <div className="membership__hero-subtitle">
          Wybierz pakiet, który najlepiej pasuje do Twojego stylu gry
        </div>
      </div>
      <div className="membership__content">
        <div className="membership__content-card">
          <h2 className="membership__content-card-heading">Pakiet Standard</h2>
          <div className="membership__content-price">
            <span className="membership__price-currency">PLN </span>
            <span className="membership__price-amount">99</span>
            <span className="membership__price-period">/ m-c</span>
          </div>
          <p className="membership__content-card-description">
            Idealny dla osób grających rekreacyjnie, ceniących komfort i wygodę.
          </p>
          <ul className="membership__content-card-list">
            <li className="membership__content-card-list-item">
              <span className="membership__content-highlight">10% zniżki </span>
              na rezerwacje kortów
            </li>
            <li className="membership__content-card-list-item">
              Darmowe wypożyczenie piłek
            </li>
            <li className="membership__content-card-list-item">
              Dostęp do szatni VIP i strefy relaksu
            </li>
            <li className="membership__content-card-list-item not-included">
              Brak udziału w ligach klubowych
            </li>
            <li className="membership__content-card-list-item not-included">
              Brak darmowego naciągania rakiety
            </li>
          </ul>
          <button
            className="membership__content-card-button"
            type="button"
            onClick={handleClick}
          >
            Wybierz Standard
          </button>
        </div>
        <div className="membership__content-card featured">
          <div className="membership__card-badge">NAJPOPULARNIEJSZY</div>
          <h2 className="membership__content-card-heading featured">
            Pakiet PRO
          </h2>
          <div className="membership__content-price">
            <span className="membership__price-currency">PLN</span>
            <span className="membership__price-amount">199</span>
            <span className="membership__price-period">/ m-c</span>
          </div>
          <span className="membership__content-card-description featured">
            Dla prawdziwych pasjonatów i stałych bywalców naszego klubu.
          </span>
          <ul className="membership__content-card-list featured">
            <li className="membership__content-card-list-item">
              <span className="membership__content-highlight">25% zniżki </span>
              na rezerwacje kortów
            </li>
            <li className="membership__content-card-list-item">
              <span className="membership__content-highlight">1 darmowa </span>
              godzina gry w miesiącu
            </li>
            <li className="membership__content-card-list-item">
              Darmowe naciąganie 1 rakiety miesięcznie
            </li>
            <li className="membership__content-card-list-item">
              Udział w ligach klubowych za darmo
            </li>
            <li className="membership__content-card-list-item">
              Priorytetowa rezerwacja z wyprzedzeniem
            </li>
          </ul>
          <button
            className="membership__content-card-button featured"
            onClick={handleClick}
          >
            Wybierz PRO
          </button>
        </div>
      </div>
      <div className="membership__info">
        <h2 className="membership__info-heading">Jak to działa?</h2>
        <p className="membership__info-paragraph">
          Pakiety członkowskie odnawiają się automatycznie pierwszego dnia
          każdego miesiąca. Możesz anulować swoją subskrypcję w dowolnym
          momencie w ustawieniach swojego profilu, bez żadnych ukrytych kosztów
          ani okresów wypowiedzenia.
        </p>
      </div>
    </div>
  );
}
