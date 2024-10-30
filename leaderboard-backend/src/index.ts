import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";
import { initRedisConnection } from "./config/redis";
import Player from "./models/player";
import createApp from "./app";
import seedData from "./data/seed";

dotenv.config();

(async () => {
  try {
    await connectToDatabase();
    await initRedisConnection();
    await Player.sync();
    await seedData();

    const app = createApp();
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Sunucu ${port} numaralı portta çalışıyor.`);
    });
  } catch (error) {
    console.error("Sunucu başlatılırken bir hata oluştu:", error);
  }
})();
