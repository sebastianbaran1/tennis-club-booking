import bcrypt from "bcrypt";
import prisma from "../config/db.js";

async function main() {
  console.log("Czyszczenie bazy danych");
  await prisma.reservation.deleteMany();
  await prisma.court.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();

  console.log("Tworzenie ustawień klubu");
  await prisma.settings.create({
    data: {
      id: 1,
      schedule: {
        0: { name: "Niedziela", open: "--:--", close: "--:--" },
        1: { name: "Poniedziałek", open: "08:00", close: "22:00" },
        2: { name: "Wtorek", open: "08:00", close: "22:00" },
        3: { name: "Środa", open: "08:00", close: "22:00" },
        4: { name: "Czwartek", open: "08:00", close: "22:00" },
        5: { name: "Piątek", open: "00:00", close: "00:00" },
        6: { name: "Sobota", open: "00:00", close: "23:30" },
      },
      exceptions: [],
    },
  });

  console.log("Tworzenie użytkowników");
  const hashedPassword = await bcrypt.hash("admin", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@admin.pl",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Klubowy",
      phone: "500 000 000",
      role: "DEMO_ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "recepcja@admin.pl",
      password: hashedPassword,
      firstName: "Anna",
      lastName: "Recepcja",
      phone: "17 850 20 20",
      role: "RECEPTIONIST",
    },
  });

  const users = [];
  const firstNames = [
    "Kamil",
    "Michał",
    "Piotr",
    "Tomasz",
    "Marta",
    "Zofia",
    "Krzysztof",
    "Oliwia",
    "Jakub",
    "Natalia",
  ];
  const lastNames = [
    "Nowak",
    "Wiśniewski",
    "Wójcik",
    "Kowalczyk",
    "Kamiński",
    "Lewandowski",
    "Zieliński",
    "Szymański",
    "Woźniak",
    "Dąbrowski",
  ];
  const phones = [
    "501 234 567",
    "600 111 222",
    "733 444 555",
    "502 999 888",
    "605 123 987",
    "601 555 666",
    "790 000 111",
    "530 456 789",
    "660 112 233",
    "608 987 654",
  ];

  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `gracz${i + 1}@test.pl`,
        password: hashedPassword,
        firstName: firstNames[i],
        lastName: lastNames[i],
        phone: phones[i],
        role: "USER",
      },
    });
    users.push(user);
  }

  console.log("Tworzenie 7 kortów");
  const courts = [];
  const surfaces = [
    "Mączka",
    "Sztuczna trawa",
    "Twardy",
    "Mączka",
    "Twardy",
    "Mączka",
    "Sztuczna trawa",
  ];

  for (let i = 0; i < 7; i++) {
    const court = await prisma.court.create({
      data: {
        name: i === 6 ? "Kort Centralny" : `Kort ${i + 1}`,
        surface: surfaces[i],
        isBlocked: i === 5,
        blockReason: i === 5 ? "Renowacja nawierzchni" : "",
      },
    });
    courts.push(court);
  }

  console.log("Generowanie rezerwacji");
  const reservationsToCreate = [];

  const weekDayTemplates = [
    [
      { start: "16:00", dur: 60 },
      { start: "17:00", dur: 90 },
      { start: "18:30", dur: 90 },
      { start: "20:00", dur: 60 },
    ],
    [
      { start: "15:30", dur: 90 },
      { start: "17:00", dur: 60 },
      { start: "18:00", dur: 60 },
      { start: "19:00", dur: 90 },
    ],
    [
      { start: "09:00", dur: 60 },
      { start: "10:00", dur: 90 },
      { start: "17:30", dur: 90 },
      { start: "19:00", dur: 60 },
    ],
    [
      { start: "18:00", dur: 90 },
      { start: "19:30", dur: 90 },
      { start: "21:00", dur: 60 },
    ],
    [
      { start: "08:30", dur: 90 },
      { start: "16:30", dur: 60 },
      { start: "17:30", dur: 60 },
      { start: "18:30", dur: 90 },
    ],
    [],
  ];

  const weekendTemplates = [
    [
      { start: "08:00", dur: 90 },
      { start: "09:30", dur: 90 },
      { start: "11:00", dur: 60 },
      { start: "12:00", dur: 60 },
    ],
    [
      { start: "09:00", dur: 60 },
      { start: "10:00", dur: 90 },
      { start: "11:30", dur: 90 },
      { start: "13:00", dur: 60 },
    ],
    [
      { start: "10:30", dur: 90 },
      { start: "12:00", dur: 90 },
      { start: "14:00", dur: 60 },
      { start: "15:00", dur: 90 },
    ],
    [
      { start: "16:00", dur: 60 },
      { start: "17:00", dur: 90 },
      { start: "18:30", dur: 90 },
    ],
    [],
  ];

  const dzisiaj = new Date();

  for (let dayOffset = -5; dayOffset < 45; dayOffset++) {
    const currentDate = new Date(dzisiaj);
    currentDate.setDate(dzisiaj.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split("T")[0];
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    const templates = isWeekend ? weekendTemplates : weekDayTemplates;

    for (const court of courts) {
      if (court.isBlocked) continue;

      const randomTemplate =
        templates[Math.floor(Math.random() * templates.length)];

      for (const slot of randomTemplate) {
        if (currentDate.getDay() === 6 && slot.start >= "19:00") continue;

        const randomUser =
          Math.random() > 0.85
            ? admin
            : users[Math.floor(Math.random() * users.length)];

        reservationsToCreate.push({
          date: dateStr,
          startTime: slot.start,
          duration: slot.dur,
          courtId: court.id,
          userId: randomUser.id,
        });
      }
    }
  }

  await prisma.reservation.createMany({
    data: reservationsToCreate,
  });

  console.log("Zakończono");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
