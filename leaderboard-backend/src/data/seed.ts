import Player from "../models/player";
import { redisClient } from "../config/redis"; // Redis bağlantısı burada zaten mevcut

// Ülke adlarını ve bunların ISO 3166-1 alpha-2 kodlarını eşleştiren nesne
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

// Player veri yapısı
interface PlayerData {
  name: string;
  country: string;
  earnings: number;
}

// Rastgele isimler oluşturma fonksiyonu
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

// Rastgele ülke ve kazanç bilgisi oluşturma fonksiyonu
function getRandomCountryAndEarnings(): { country: string; earnings: number } {
  const countries = Object.keys(countryCodeMap);
  const country = countries[Math.floor(Math.random() * countries.length)];
  const earnings = Math.floor(Math.random() * 2000) + 500; // 500 ile 2500 arasında kazanç
  return { country, earnings };
}

async function seedData() {
  console.log("Mevcut veriler temizleniyor...");

  // MySQL'deki Player tablosunu temizliyoruz
  await Player.destroy({ where: {}, truncate: true });

  // Redis'teki eski liderlik verilerini temizleyelim
  await redisClient.del("weekly_leaderboard");
  await redisClient.del("leaderboard");

  const playerCount = 130;
  const players: PlayerData[] = [];

  // 130 oyuncuyu rastgele olarak oluşturuyoruz
  for (let i = 0; i < playerCount; i++) {
    const playerName = generateRandomName(i);
    const { country, earnings } = getRandomCountryAndEarnings();
    players.push({ name: playerName, country, earnings });
  }

  // Oyuncuları hem MySQL veritabanına hem de Redis'e ekliyoruz
  for (const playerData of players) {
    try {
      // Ülke kodunu belirliyoruz
      const countryCode =
        countryCodeMap[playerData.country] || playerData.country;

      // Oyuncuyu MySQL'e ekliyoruz
      const player = await Player.create({
        ...playerData,
        country: countryCode, // Ülke kodunu burada kullanıyoruz
      });
      console.log(`Oyuncu eklendi: ${playerData.name} (${playerData.country})`);

      // Redis'e hem weekly_leaderboard hem de leaderboard'a oyuncunun kazancını ekliyoruz
      await redisClient.zAdd("weekly_leaderboard", {
        score: playerData.earnings,
        value: player.id.toString(), // Oyuncunun ID'sini Redis'e ekliyoruz
      });

      await redisClient.zAdd("leaderboard", {
        score: playerData.earnings,
        value: player.id.toString(), // Oyuncunun ID'sini Redis'e ekliyoruz
      });
    } catch (error) {
      console.error(`Oyuncu eklenirken hata oluştu: ${playerData.name}`, error);
    }
  }

  console.log("Seed verileri başarıyla eklendi!");
}

export default seedData;
