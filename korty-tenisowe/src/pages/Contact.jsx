import "./Contact.css";

function Card({ label, title, text, subtext }) {
  return (
    <div className="contact__content-card">
      <span className="contact__content-card-label">{label}</span>
      <h3 className="contact__content-card-title">{title}</h3>
      <span className="contact__content-card-text">{text} </span>
      <span className="contact__content-card-subtext">{subtext}</span>
    </div>
  );
}

export default function Contact() {
  return (
    <div className="contact-page">
      <div className="contact__hero">
        <div className="contact__hero-title">Jesteśmy do Twojej dyspozycji</div>
        <div className="contact__hero-subtitle">
          Masz pytania dotyczące akademii, turniejów lub wynajmu
          długoterminowego? Skontaktuj się z nami!
        </div>
      </div>
      <div className="contact__content">
        <div className="contact__content-heading">
          <h2 className="contact__content-heading-title">
            Skontaktuj się z nami
          </h2>
          <p className="contact__content-heading-paragraph">
            Nasza recepcja pracuje w godzinach otwarcia klubu. W przypadku spraw
            pilnych prosimy o kontakt teletoniczny.
          </p>
        </div>
        <div className="contact__content-cards">
          <Card
            label="ADRES"
            title="Gdzie gramy"
            text={
              <>
                ul. Korty Tenisowe 1<br />
                35-000 Rzeszów
              </>
            }
            subtext=""
          />
          <Card
            label="TELEFON"
            title="Infolinia"
            text="+48 123 456 789"
            subtext={
              <>
                Wew. 1 - Recepcja <br /> Wew. 2 - Trenerzy
              </>
            }
          />
          <Card
            label="E - MAIL"
            title="Napisz do nas"
            text="kontakt@rzeszowtenisklub.pl"
            subtext=""
          />
        </div>
        <div className="contact__content-hours">
          <h3 className="contact__content-hours-heading">Godziny otwarcia</h3>
          <div className="contact__content-hours-list">
            <div className="contact__content-hours-item">
              <span className="contact__content-hours-item-days">
                Poniedziałek - Piątek
              </span>
              <span className="contact__content-hours-item-time">
                08:00 - 22:00
              </span>
            </div>
            <div className="contact__content-hours-item">
              <span className="contact__content-hours-item-days">Sobota</span>
              <span className="contact__content-hours-item-time">
                08:00 - 20:00
              </span>
            </div>
            <div className="contact__content-hours-item">
              <span className="contact__content-hours-item-days">
                Niedziela
              </span>
              <span className="contact__content-hours-item-time">
                08:00 - 20:00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
