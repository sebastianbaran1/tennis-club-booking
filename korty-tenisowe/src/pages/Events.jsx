import { useOutletContext, useNavigate } from "react-router-dom";
import "./Events.css";

function EventsCard({
  month,
  date,
  time,
  heading,
  price,
  category,
  text,
  isPast,
  onClick,
}) {
  return (
    <div
      className={`events__content-card${isPast ? " events__content-card--past" : ""}`}
    >
      <div className="events__content-card-date-wrapper">
        <span className="events__month">{month}</span>
        <span className="events__date">{date}</span>
        <span className="events__time">{time}</span>
      </div>
      <div className="events__content-card-wrapper">
        <h2 className="events__content-card-heading">{heading}</h2>
        <div className="events__content-card-details-wrapper">
          <p className="events__content-card-details-price">
            <span className="events__content-card-details-price-featured">
              Wpisowe:{" "}
            </span>
            {price}
          </p>
          <p className="events__content-card-details-category">
            <span className="events__content-card-details-price-featured">
              Kategoria:{" "}
            </span>
            {category}
          </p>
        </div>
        <p className="events__content-card-text">{text}</p>
        {isPast ? (
          <button
            className="events__content-card-button events__content-card-button-disabled"
            type="button"
            disabled
          >
            Zakończone
          </button>
        ) : (
          <button
            className="events__content-card-button"
            type="button"
            onClick={onClick}
          >
            Zapisz się
          </button>
        )}
      </div>
    </div>
  );
}

export default function Events() {
  const navigate = useNavigate();

  const { user, setIsLoginOpen } = useOutletContext();

  const handleClick = () => {
    if (!user) {
      setIsLoginOpen(true);
    } else {
      navigate("/profil");
    }
  };

  return (
    <div className="events-page">
      <div className="events__hero-wrapper">
        <div className="events__hero-title">Wydarzenia i Turnieje</div>
        <div className="events__hero-subtitle">
          Rywalizacja, rozwój i świetna zabawa. Sprawdź kalendarz klubowy!
        </div>
      </div>
      <div className="events__content-wrapper">
        <EventsCard
          month="SIERPIEŃ"
          date="15"
          time="10:00 - 18:00"
          heading="Rzeszów Open (Amatorzy)"
          price="50 zł"
          category="Debel Mężczyzn"
          text="Nasz flagowy, wakacyjny turniej deblowy dla graczy amatorskich. Gwarantowane minimum 3 mecze dla każdej pary (system grupowy). W cenie wpisowego grill klubowy, pamiątkowe koszulki i puchary dla najlepszych."
          isPast={false}
          onClick={handleClick}
        />
        <EventsCard
          month="SIERPIEŃ"
          date="20"
          time="09:00 - 17:00"
          heading="Turniej dziecięcy"
          price="Bezpłatne"
          category="U-10 oraz U-12"
          text="Oficjalne zakończenie wakacji z rakietą! Zapraszamy wszystkie dzieci trenujące w naszej szkółce na mini-turniej. Zapewniamy mnóstwo gier i zabaw ruchowych, medale ala kazaego uczestnika oraz stoaki poczęstunek."
          isPast={false}
          onClick={handleClick}
        />
        <EventsCard
          month="LIPIEC"
          date="10"
          time="22:00 - 03:00"
          heading="Nocne granie"
          price="70 zł"
          category="Open"
          text="Nocne granie na kortach z oświetleniem LED. Turniej dla wszystkich chętnych, którzy chcą poczuć dreszczyk emocji i rywalizacji w nietypowych godzinach. W cenie wpisowego ciepły posiłek oraz napoje."
          isPast={true}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
