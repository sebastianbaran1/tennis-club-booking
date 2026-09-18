import StaticPageLayout from "./StaticPageLayout";
import "./StaticPageLayout.css";

export default function Career() {
  return (
    <StaticPageLayout label="REKRUTACJA" title="Dołącz do zespołu">
      <p className="static-page__intro">
        Szukamy pasjonatów tenisa, dla których kort to drugi dom. W Rzeszów
        Tennis Club stawiamy na rozwój, świetną atmosferę i profesjonalizm.
        Sprawdź kogo aktualnie poszukujemy:
      </p>

      <div className="careers__job-offer">
        <h2 className="careers__job-title">
          Trener / Instruktorka Tenisa Ziemnego
        </h2>
        <div className="careers__type">PEŁNY ETAT LUB B2B</div>

        <ul className="careers__job-details">
          <li>Prowadzenie treningów z dziećmi (Tenis10) oraz dorosłymi.</li>
          <li>Wymagana licencja PZT (minimum Instruktor).</li>
          <li>
            Oferujemy elastyczny grafik i dostęp do kortów poza godzinami pracy.
          </li>
        </ul>

        <p className="careers__contact">
          Zainteresowany? Wyślij CV na:{" "}
          <a href="mailto:praca@rzeszowtenisklub.pl">
            praca@rzeszowtenisklub.pl
          </a>
        </p>
      </div>
    </StaticPageLayout>
  );
}
