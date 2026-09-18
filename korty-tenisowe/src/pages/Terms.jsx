import StaticPageLayout from "./StaticPageLayout";
import "./StaticPageLayout.css";

export default function Terms() {
  return (
    <StaticPageLayout label="DOKUMENTY" title="Regulamin Klubu">
      <div className="document">
        <h3 className="document__title">1. Postanowienia ogólne</h3>
        <p className="document__text">
          Niniejszy regulamin określa zasady korzystania z infrastruktury oraz
          systemu rezerwacji Rzeszów Tennis Club. Wejście na teren obiektu lub
          dokonanie rezerwacji online jest równoznaczne z akceptacją niniejszego
          regulaminu.
        </p>
      </div>

      <div className="document">
        <h3 className="document__title">2. Zasady rezerwacji i płatności</h3>
        <p className="document__text">
          Rezerwacji kortów można dokonywać za pośrednictwem systemu online
          dostępnego na stronie klubu.
        </p>
        <p className="document__text">
          Odwołanie rezerwacji bez ponoszenia kosztów jest możliwe na
          maksymalnie 12 godzin przed planowanym rozpoczęciem gry.
        </p>
        <p className="document__text">
          W przypadku rezerwacji cyklicznych obowiązują osobne umowy zawierane w
          recepcji klubu.
        </p>
      </div>

      <div className="document">
        <h3 className="document__title">3. Zasady zachowania na korcie</h3>
        <p className="document__text">
          Wszyscy gracze zobowiązani są do gry w odpowiednim obuwiu sportowym
          przystosowanym do nawierzchni ceglanej. Obowiązuje strój sportowy oraz
          zasady fair play. Po zakończonej grze uczestnicy zobowiązani są do
          zatarcia kortu siatką.
        </p>
      </div>
    </StaticPageLayout>
  );
}
