import StaticPageLayout from "./StaticPageLayout";
import "./StaticPageLayout.css";

export default function Privacy() {
  return (
    <StaticPageLayout label="DOKUMENTY" title="Polityka Prywatności">
      <div className="document">
        <h3 className="document__title">1. Administrator Danych</h3>
        <p className="document__text">
          Administratorem Twoich danych osobowych jest Rzeszów Tennis Club.
          Przetwarzamy Twoje dane wyłącznie w celu obsługi systemu rezerwacji
          oraz komunikacji związanej z naszą działalnością sportową.
        </p>
      </div>
      <div className="document">
        <h3 className="document__title">2. Zakres zbieranych danych</h3>
        <p className="document__text">
          Podczas rejestracji w systemie prosimy o podanie podstawowych
          informacji niezbędnych do realizacji usług: Imię, Nazwisko, Adres
          e-mail oraz Numer telefonu kontaktowego.
        </p>
      </div>
      <div className="document">
        <h3 className="document__title">3. Ochrona danych (RODO)</h3>
        <p className="document__text">
          Posiadasz pełne prawo do wglądu, edycji oraz całkowitego usunięcia
          swoich danych z naszego systemu.
        </p>
        <p className="document__text">
          Twoje dane są bezpiecznie przechowywane i nie są udostępniane
          podmiotom trzecim w celach reklamowych.
        </p>
        <p className="document__text">
          W przypadku chęci usunięcia konta prosimy o kontakt z naszą recepcją
          lub skorzystanie z odpowiedniej opcji w panelu użytkownika.
        </p>
      </div>{" "}
    </StaticPageLayout>
  );
}
