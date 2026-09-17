import { useOutletContext, useNavigate } from "react-router-dom";
import "./About.css";

export default function About() {
  const { user, setIsRegisterOpen } = useOutletContext();
  const navigate = useNavigate();
  const handleClick = () => {
    if (!user) {
      setIsRegisterOpen(true);
    } else {
      navigate("/profil");
    }
  };
  return (
    <div className="about-page">
      <div className="about__hero-wrapper">
        <h1 className="about__hero-title">Tradycja, Pasja, Tenis</h1>
        <p className="about__hero-subtitle">
          Poznaj historię Rzeszów Tenis Club
        </p>
      </div>
      <div className="about__content-wrapper">
        <div className="about__history-wrapper">
          <h2 className="about__history-heading">Nasza Historia</h2>
          <p className="about__history-paragraph">
            Rzeszów Tennis Club powstał w 2012 roku z inicjatywy grupy
            pasjonatów, dla których tenis to coś więcej niż tylko sport.
            Zaczynaliśmy od dwóch skromnych kortów o nawierzchni ceglanej,
            budując miejsce, w którym każdy, niezależnie od poziomu, mógł poczuć
            się jak u siebie.
          </p>
          <p className="about__history-paragraph">
            Dziś jesteśmy najnowocześniejszym obiektem w regionie. Dysponujemy
            wieloma kortami o standardzie ITF, innowacyjnym systemem rezerwacji
            online oraz kadrą trenerską z najwyższymi uprawnieniami PZT. Nasz
            klub to jednak nie tylko infrastruktura - to przede wszystkim
            fantastyczni ludzie.
          </p>
        </div>
        <div className="about__stats-wrapper">
          <div className="about__stats-item">
            <span className="about__stats-item-number">2012</span>
            <span className="about__stats-item-label">ROK ZAŁOŻENIA</span>
          </div>
          <div className="about__stats-item">
            <span className="about__stats-item-number">7</span>
            <span className="about__stats-item-label">
              PROFESJONALNYCH KORTÓW
            </span>
          </div>
          <div className="about__stats-item">
            <span className="about__stats-item-number">15+</span>
            <span className="about__stats-item-label">TURNIEJÓW ROCZNIE</span>
          </div>
          <div className="about__stats-item">
            <span className="about__stats-item-number">500+</span>
            <span className="about__stats-item-label">ZADOWOLONYCH GRACZY</span>
          </div>
        </div>
      </div>
      <div className="about__mission-wrapper">
        <h2 className="about__mission-heading">Nasza Misja</h2>
        <p className="about__mission-paragraph">
          Chcemy, aby tenis był dostępny dla każdego - od najmłodszych,
          stawiających pierwsze kroki na korcie, po doświadczonych amatorów i
          zawodowców. Tworzymy przestrzeń, w której sportowa rywalizacja spotyka
          się z szacunkiem, a wysiłek z ogromną satysfakcją.
        </p>
        <p className="about__mission-text-under" onClick={handleClick}>
          Dołącz do nas i stań się częścią tej historii!
        </p>
      </div>
    </div>
  );
}
