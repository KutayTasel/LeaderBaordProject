import Player from "../models/player";
import { redisClient } from "../config/redis";

const countryCodeMap = {
  "United States": "US",
  "United Kingdom": "GB",
  Germany: "DE",
  Turkey: "TR",
  France: "FR",
  Spain: "ES",
  China: "CN",
  Brazil: "BR",
  Australia: "AU",
};

interface PlayerData {
  name: string;
  country: string;
  earnings: number;
}

function generateRandomName(index: number): string {
  const firstNames = [
    "John",
    "Jane",
    "Alex",
    "Chris",
    "Pat",
    "Taylor",
    "Jordan",
    "Casey",
    "Morgan",
    "Riley",
    "Sam",
    "Kim",
    "Blake",
    "Devin",
    "Logan",
    "Charlie",
    "Quinn",
    "Avery",
    "Skylar",
    "Elliot",
    "Rowan",
    "Remy",
    "Jesse",
    "Kai",
    "Drew",
    "Hayden",
    "Emerson",
    "Phoenix",
    "Peyton",
    "Reese",
    "Dakota",
    "Jamie",
    "Shawn",
    "Blair",
    "Cameron",
    "Finley",
    "Harley",
    "Kendall",
    "Lane",
    "Parker",
  ];
  return `${firstNames[index % firstNames.length]}_${index}`;
}

function getRandomCountryAndEarnings(): { country: string; earnings: number } {
  const countries = Object.keys(countryCodeMap);
  const country = countries[Math.floor(Math.random() * countries.length)];
  const earnings = Math.floor(Math.random() * 2000) + 500;
  return { country, earnings };
}
async function seedData() {
  console.log("Mevcut veriler temizleniyor...");
  await Player.destroy({ where: {}, truncate: true });

  await redisClient.del("weekly_leaderboard");
  await redisClient.del("leaderboard");

  const playerCount = 130;
  const players: PlayerData[] = [];
  for (let i = 0; i < playerCount; i++) {
    const playerName = generateRandomName(i);
    const { country, earnings } = getRandomCountryAndEarnings();
    players.push({ name: playerName, country, earnings });
  }

  await Promise.all(
    players.map(async (playerData, index) => {
      try {
        const countryCode =
          countryCodeMap[playerData.country] || playerData.country;
        const player = await Player.create({
          ...playerData,
          country: countryCode,
        });

        console.log(
          `Oyuncu eklendi (${index + 1}/${playerCount}): ${playerData.name} (${
            playerData.country
          })`
        );
        await redisClient.zAdd("weekly_leaderboard", {
          score: playerData.earnings,
          value: player.id.toString(),
        });

        await redisClient.zAdd("leaderboard", {
          score: playerData.earnings,
          value: player.id.toString(),
        });
      } catch (error) {
        console.error(
          `Oyuncu eklenirken hata oluştu (${index + 1}): ${playerData.name}`,
          error
        );
      }
    })
  );

  console.log("Seed verileri başarıyla eklendi!");
}

export default seedData;
