"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app")); // Uygulamanızın oluşturulduğu dosya
const redis_1 = require("../config/redis"); // Redis istemcisi ekleniyor
const database_1 = require("../config/database");
const database_2 = __importDefault(require("../config/database")); // Sequelize örneği
const player_1 = __importDefault(require("../models/player")); // Player modelini import et
describe("Leaderboard API", () => {
    let app;
    beforeAll(async () => {
        await (0, database_1.connectToDatabase)(); // Veritabanı bağlantısını başlat
        await (0, redis_1.initRedisConnection)(); // Redis bağlantısını başlat
        app = (0, app_1.default)(); // Uygulamayı oluştur
        // Seed verilerini ekle
        await seedData(); // Seeding fonksiyonunu çağır
    });
    afterAll(async () => {
        // Redis ve veritabanı bağlantılarını kapat
        await redis_1.redisClient.quit(); // Redis bağlantısını kapat
        await database_2.default.close(); // MySQL bağlantısını kapat
    });
    // Mevcut oyuncu ile test et
    test("should get player profile", async () => {
        const response = await (0, supertest_1.default)(app).get("/player/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("country");
        expect(response.body).toHaveProperty("earnings");
        expect(response.body.name).toBe("Kutay"); // Seeding'de tanımlanan oyuncunun adı
    });
    test("should update player earnings", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/update-earnings")
            .send({ playerId: 1, earnings: 500 });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Earnings updated successfully");
    });
    test("should get leaderboard for a player", async () => {
        const response = await (0, supertest_1.default)(app).get("/leaderboard/player/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("topPlayers");
        expect(response.body).toHaveProperty("surroundingPlayers");
        expect(response.body).toHaveProperty("playerRank");
    });
    test("should distribute prizes", async () => {
        const response = await (0, supertest_1.default)(app).post("/leaderboard/reset");
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Prizes distributed and leaderboard reset successfully");
    });
    test("should get prize pool", async () => {
        const response = await (0, supertest_1.default)(app).get("/leaderboard/prizepool");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("prizePool");
    });
    // Ek test senaryoları burada...
});
// Seeding fonksiyonu
async function seedData() {
    await player_1.default.destroy({ where: {}, truncate: true });
    const players = [
        { name: "Kutay", country: "USA", earnings: 1000 },
        { name: "Berkay", country: "UK", earnings: 1200 },
        { name: "Merih", country: "Germany", earnings: 950 },
        { name: "Furkan", country: "Turkey", earnings: 1100 },
    ];
    for (const playerData of players) {
        await player_1.default.create(playerData);
    }
}
