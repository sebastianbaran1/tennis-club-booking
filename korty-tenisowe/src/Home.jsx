import { useNavigate, useOutletContext } from "react-router-dom";
import "./Home.css";

import iconKort from "./assets/icon-kort.png";
import iconTrener from "./assets/icon-trener.png";
import iconSpolecznosc from "./assets/icon-spolecznosc.png";
import iconKawa from "./assets/icon-kawa.png";

import imgJan from "./assets/jan-kowalski.webp";
import imgKarolinaM from "./assets/karolina-mazur.webp";
import imgMichal from "./assets/michal-zielinski.webp";
import imgKarolinaS from "./assets/karolina-szymanska.webp";

export default function Home() {
  const navigate = useNavigate();
  const { user, setIsLoginOpen } = useOutletContext();

  const handleReservationClick = () => {
    if (!user) {
      alert("Musisz być zalogowany, aby zarezerwować kort!");
      setIsLoginOpen(true);
      return;
    }
    navigate("/kalendarz");
  };

  const FEATURES_DATA = [
    {
      id: 1,
      title: "Światowej klasy korty tenisowe",
      subtitle:
        "Profesjonalne nawierzchnie dostosowane do najwyższych standardów ITF.",
      iconAlt: "Kort",
      imageSrc: iconKort,
    },
    {
      id: 2,
      title: "Doświadczona kadra",
      subtitle:
        "Trenerzy z licencjami PZT, którzy pomogą Ci wejść na wyższy poziom gry.",
      iconAlt: "Trener",
      imageSrc: iconTrener,
    },
    {
      id: 3,
      title: "Zgrana społeczność",
      subtitle:
        "Miejsce spotkań pasjonatów tenisa, amatorskie ligi i turnieje klubowe.",
      iconAlt: "Społeczność",
      imageSrc: iconSpolecznosc,
    },
    {
      id: 4,
      title: "Komfort i wyposażenie",
      subtitle:
        "Wypożyczysz u nas profesjonalny sprzęt, a po meczu odpoczniesz przy kawie.",
      iconAlt: "Filiżanka kawy",
      imageSrc: iconKawa,
    },
  ];

  const STAFF_DATA = [
    {
      id: 1,
      name: "Jan Kowalski",
      role: "Trener Główny / Licencja PZT",
      description:
        "Specjalizuje się w technice zawodniczej i przygotowaniu motorycznym.",
      imageSrc: imgJan,
    },
    {
      id: 2,
      name: "Karolina Mazur",
      role: "Instruktorka PZT / Szkółka Dziecięca",
      description:
        "Z pasją wprowadza najmłodszych w świat tenisa. Jej zajęcia to idealne połączenie zabawy i nauki prawidłowych nawyków ruchowych.",
      imageSrc: imgKarolinaM,
    },
    {
      id: 3,
      name: "Michał Zieliński",
      role: "Trener Zawodniczy / Sparring Partner",
      description:
        "Były zawodnik z międzynarodowym doświadczeniem. Skupia się na zaawansowanej taktyce, psychologii sportu i szlifowaniu detali.",
      imageSrc: imgMichal,
    },
    {
      id: 4,
      name: "Karolina Szymańska",
      role: "Trenerka Tenisa / Przygotowanie Fizyczne",
      description:
        "Pomaga dorosłym amatorom poprawić dynamikę i siłę na korcie. Gwarantuje intensywny trening w świetnej, motywującej atmosferze.",
      imageSrc: imgKarolinaS,
    },
  ];

  function FeatureCard({ feature }) {
    return (
      <div className="features__grid-item">
        <div className="features__icon-wrapper">
          <img src={feature.imageSrc} alt={feature.title} />
        </div>
        <h3 className="features__grid-item-title">{feature.title}</h3>
        <p className="features__grid-item-subtitle">{feature.subtitle}</p>
      </div>
    );
  }

  function StaffCard({ staff }) {
    return (
      <div className="staff__grid-item">
        <div className="staff__grid-item-image-wrapper">
          <img
            src={staff.imageSrc}
            alt={staff.name}
            className="staff__grid-item-image"
          />
        </div>
        <h3 className="staff__grid-item-name">{staff.name}</h3>
        <h4 className="staff__grid-item-role">{staff.role}</h4>
        <p className="staff__grid-item-description">{staff.description}</p>
      </div>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__container">
          <h1 className="hero__title">Witaj w Rzeszów Tennis Club!</h1>
          <p className="hero__subtitle">
            Najlepsze korty w mieście czekają na Ciebie.
          </p>

          <button className="hero__button" onClick={handleReservationClick}>
            ZAREZERWUJ KORT
          </button>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="features__title">Co nas wyróżnia?</h2>
          <div className="features__grid">
            {FEATURES_DATA.map((item) => (
              <FeatureCard key={item.id} feature={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="staff">
        <div className="container">
          <h2 className="staff__title">Poznaj naszą kadrę</h2>
          <div className="staff__grid">
            {STAFF_DATA.map((person) => (
              <StaffCard key={person.id} staff={person} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
