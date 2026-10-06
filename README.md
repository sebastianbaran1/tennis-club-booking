# Rzeszów Tennis Club – System Rezerwacji Kortów / Court Booking System

> **[English version below](#english-version)**

### [Zobacz działającą aplikację](https://tennis-club-booking.vercel.app)

Aplikacja webowa typu Full-Stack (SPA) do obsługi rezerwacji kortów, zarządzania użytkownikami oraz harmonogramem lokalnego klubu tenisowego.

## Technologie
- **Frontend:** React, React Router, CSS
- **Backend:** Node.js, Express.js
- **Baza Danych:** PostgreSQL, Prisma ORM

## Kluczowe funkcjonalności 
- **Zaawansowany system ról i uprawnień:** Aplikacja obsługuje pięć poziomów dostępu: Gość, Użytkownik, Recepcja, Administrator oraz specjalne konto Demo. To ostatnie umożliwia pełny wgląd do systemu przy jednoczesnej blokadzie edycji danych w panelu administracyjnym.
- **Płynna konwersja kont gości:** Rezerwacja dokonana przez recepcję dla nowej osoby automatycznie generuje w tle profil o statusie Gościa. Jeśli klient założy później konto z użyciem tego samego adresu e-mail, system samoistnie podniesie jego uprawnienia do poziomu Użytkownika, zachowując pełną historię dotychczasowych gier.
- **Dynamiczny i skalowalny kalendarz:** Harmonogram elastycznie dostosowuje się do dowolnej liczby kortów. System działa w czasie rzeczywistym – automatycznie blokuje minione godziny, eliminuje ryzyko nakładania się rezerwacji, obsługuje warianty 60- i 90-minutowe oraz natychmiast reaguje na wyłączenia techniczne konkretnych obiektów.
- **Panel zarządzania klubem:** Miejsce, w którym administrator ma pełną kontrolę nad systemem. Pozwala na sprawne zarządzanie infrastrukturą (dodawanie nowych kortów, usuwanie oraz wyłączanie ich z użytku z podaniem powodu, np. „Renowacja” – blokada pozostaje aktywna aż do ręcznego odblokowania), swobodną edycję danych i ról użytkowników, a także na szczegółową konfigurację harmonogramu pracy klubu – indywidualnie dla każdego dnia tygodnia, włącznie z dniami wolnymi.
- **Eliminacja podwójnych rezerwacji (Race Conditions):** Problem jednoczesnego zajmowania tego samego terminu przez różnych użytkowników został rozwiązany na poziomie bazy danych. Cały proces zapisu zabezpieczono transakcją Prisma z poziomem izolacji Serializable, co gwarantuje pełną atomowość i spójność operacji.
- **Walidacja na poziomie API:** System nie polega wyłącznie na danych z frontendu. Weryfikacja dostępności kortów, godzin pracy i nakładających się rezerwacji zachodzi w API, co eliminuje ryzyko błędów lub nadużyć.

## Zrzuty ekranu

**Strona główna**
<img width="100%" alt="Strona główna" src="https://github.com/user-attachments/assets/1a84afc1-2b27-4454-9070-d54fa1790b41" />


**Kalendarz rezerwacji (Desktop vs Mobile)**
<table align="center">
  <tr>
    <td align="center" width="75%"><b>Wersja na komputer</b></td>
    <td align="center" width="25%"><b>Wersja na telefon</b></td>
  </tr>
  <tr>
    <td align="center" valign="middle">
      <img src="https://github.com/user-attachments/assets/0ef0a76b-5fee-4b36-84eb-45eab42a4258" alt="Kalendarz rezerwacji Desktop">
    </td>
    <td align="center" valign="middle">
      <img src="https://github.com/user-attachments/assets/b3ca0095-2208-4bb4-a5ae-0f4af0b07f5e" alt="Kalendarz rezerwacji Mobile">
    </td>
  </tr>
</table>


**Panel Administratora**
<img width="100%" alt="Panel Administratora" src="https://github.com/user-attachments/assets/8f48955c-edc3-494c-af72-9f3e81be1167">

## Uruchomienie Lokalne

```bash
git clone https://github.com/sebastianbaran1/tennis-club-booking.git
cd tennis-club-booking
```

### Zmienne środowiskowe (.env)
W folderze `backend-tenis`:
```env
DATABASE_URL="postgresql://uzytkownik:haslo@localhost:5432/tennis_db"
JWT_SECRET="twoj_tajny_klucz"
```
W folderze `korty-tenisowe`:
```env
VITE_API_URL="http://localhost:5005"
```

> **💡 Uwaga o uprawnieniach:** Aby chronić środowisko produkcyjne (Live Demo), skrypt `seed.js` domyślnie tworzy konto administratora z bezpieczną rolą `DEMO_ADMIN`. Jeśli uruchamiasz projekt lokalnie i chcesz przetestować pełne możliwości edycji w panelu administracyjnym, przed wykonaniem poniższych komend otwórz plik `backend-tenis/prisma/seed.js` i w linijce ~38 zmień `role: "DEMO_ADMIN"` na `role: "ADMIN"`.

### Backend
W nowym oknie terminala:
```bash
cd backend-tenis
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js # Skrypt wygeneruje m.in. konto Admina i rezerwacje
npm run dev
```

### Frontend
W nowym oknie terminala:
```bash
cd korty-tenisowe
npm install
npm run dev
```

## Konta Testowe
Na ekranie logowania użyj przycisku **"Użyj konta testowego"**, by błyskawicznie zalogować się do systemu, lub wpisz dane ręcznie:

| Rola | Email | Hasło |
|---|---|---|
| **Administrator / Demo** | admin@admin.pl | admin |
| **Recepcja** | recepcja@admin.pl | admin |
| **Użytkownik** | gracz1@test.pl | admin |

---
---

<a name="english-version"></a>
## English Version

### [Live Demo](https://tennis-club-booking.vercel.app) 

A Full-Stack web application (SPA) for handling court reservations, managing users, and configuring the schedule of a local tennis club.

## Technologies
- **Frontend:** React, React Router, CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, Prisma ORM

## Key Features
- **Advanced role and permission system:** The application supports five access levels: Guest, User, Reception, Administrator, and a special Demo account. The last one allows full insight into the system while blocking data editing in the admin panel.
- **Seamless guest account conversion:** A reservation made by the reception for a new person automatically generates a Guest profile in the background. If the client later creates an account using the same e-mail address, the system automatically upgrades their permissions to the User level, preserving the full history of their past games.
- **Dynamic and scalable calendar:** The schedule flexibly adapts to any number of courts. The system works in real-time – it automatically blocks past hours, eliminates the risk of overlapping reservations, supports 60- and 90-minute variants, and reacts immediately to technical exclusions of specific courts.
- **Club management panel:** A place where the administrator has full control over the system. It allows for efficient infrastructure management (adding new courts, deleting and disabling them with a reason, e.g., "Renovation" - the block remains active until manually unlocked), easy editing of user data and roles, as well as detailed configuration of the club's working schedule - individually for each day of the week, including holidays.
- **Elimination of double bookings (Race Conditions):** The problem of different users booking the same time slot simultaneously has been solved at the database level. The entire saving process is secured by a Prisma transaction with a Serializable isolation level, guaranteeing full atomicity and consistency of operations.
- **API-level validation:** The system does not rely solely on frontend data. Verification of court availability, operating hours, and overlapping reservations is handled by the API, eliminating the risk of errors or abuse.

## Screenshots

**Landing page**
<img width="100%" alt="Landing page" src="https://github.com/user-attachments/assets/1a84afc1-2b27-4454-9070-d54fa1790b41" />


**Reservation Calendar (Desktop vs Mobile)**
<table align="center">
  <tr>
    <td align="center" width="75%"><b>Desktop version</b></td>
    <td align="center" width="25%"><b>Mobile version</b></td>
  </tr>
  <tr>
    <td align="center" valign="middle">
      <img src="https://github.com/user-attachments/assets/0ef0a76b-5fee-4b36-84eb-45eab42a4258" alt="Reservation Calendar Desktop">
    </td>
    <td align="center" valign="middle">
      <img src="https://github.com/user-attachments/assets/b3ca0095-2208-4bb4-a5ae-0f4af0b07f5e" alt="Reservation Calendar Mobile">
    </td>
  </tr>
</table>


**Admin Panel**
<img width="100%" alt="Admin Panel" src="https://github.com/user-attachments/assets/8f48955c-edc3-494c-af72-9f3e81be1167">



## Local Setup

```bash
git clone https://github.com/sebastianbaran1/tennis-club-booking.git
cd tennis-club-booking
```

### Environment variables (.env)
In the `backend-tenis` folder:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/tennis_db"
JWT_SECRET="your_secret_key"
```
In the `korty-tenisowe` folder:
```env
VITE_API_URL="http://localhost:5005"
```

> **💡 Note on permissions:** To protect the production environment (Live Demo), the `seed.js` script defaults to creating an administrator account with the secure `DEMO_ADMIN` role. If you are running the project locally and want to test the full editing capabilities in the admin panel, before running the commands below, open the `backend-tenis/prisma/seed.js` file and on line ~38 change `role: "DEMO_ADMIN"` to `role: "ADMIN"`.

### Backend
In a new terminal window:
```bash
cd backend-tenis
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js # The script will generate, among others, an Admin account and reservations
npm run dev
```

### Frontend
In a new terminal window:
```bash
cd korty-tenisowe
npm install
npm run dev
```

## Test Accounts
On the login screen, use the **"Użyj konta testowego"** (Use test account) button to instantly log into the system, or enter the data manually:

| Role | Email | Password |
|---|---|---|
| **Administrator / Demo** | admin@admin.pl | admin |
| **Reception** | recepcja@admin.pl | admin |
| **User** | gracz1@test.pl | admin |
