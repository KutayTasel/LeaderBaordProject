import request from "supertest";
import createApp from "../app"; // Uygulamanızın oluşturulduğu dosya
import { initRedisConnection, redisClient } from "../config/redis"; // Redis istemcisi ekleniyor
import { connectToDatabase } from "../config/database";
import sequelize from "../config/database"; // Sequelize örneği
import Player from "../models/player"; // Player modelini import et

describe("Leaderboard API", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    await connectToDatabase(); // Veritabanı bağlantısını başlat
    await initRedisConnection(); // Redis bağlantısını başlat
    app = createApp(); // Uygulamayı oluştur

    // Seed verilerini ekle
    await seedData(); // Seeding fonksiyonunu çağır
  });

  afterAll(async () => {
    // Redis ve veritabanı bağlantılarını kapat
    await redisClient.quit(); // Redis bağlantısını kapat
    await sequelize.close(); // MySQL bağlantısını kapat
  });

  // Mevcut oyuncu ile test et
  test("should get player profile", async () => {
    const response = await request(app).get("/player/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("country");
    expect(response.body).toHaveProperty("earnings");
    expect(response.body.name).toBe("Kutay"); // Seeding'de tanımlanan oyuncunun adı
  });

  test("should update player earnings", async () => {
    const response = await request(app)
      .post("/update-earnings")
      .send({ playerId: 1, earnings: 500 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Earnings updated successfully");
  });

  test("should get leaderboard for a player", async () => {
    const response = await request(app).get("/leaderboard/player/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("topPlayers");
    expect(response.body).toHaveProperty("surroundingPlayers");
    expect(response.body).toHaveProperty("playerRank");
  });

  test("should distribute prizes", async () => {
    const response = await request(app).post("/leaderboard/reset");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Prizes distributed and leaderboard reset successfully"
    );
  });

  test("should get prize pool", async () => {
    const response = await request(app).get("/leaderboard/prizepool");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("prizePool");
  });

  // Ek test senaryoları burada...
});

// Seeding fonksiyonu
async function seedData() {
  await Player.destroy({ where: {}, truncate: true });

  const players = [
    { name: "Kutay", country: "USA", earnings: 1000 },
    { name: "Berkay", country: "UK", earnings: 1200 },
    { name: "Merih", country: "Germany", earnings: 950 },
    { name: "Furkan", country: "Turkey", earnings: 1100 },
  ];

  for (const playerData of players) {
    await Player.create(playerData);
  }
}
