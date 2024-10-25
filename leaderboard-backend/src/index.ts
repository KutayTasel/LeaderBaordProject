import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";
import { initRedisConnection } from "./config/redis";
import Player from "./models/player";
import createApp from "./app";
import seedData from "./data/seed"; // Seed fonksiyonunu dahil ediyoruz

// .env dosyasını yüklemek için dotenv'i yapılandırıyoruz
dotenv.config();

(async () => {
  try {
    // MySQL ve Redis bağlantısını başlatıyoruz
    await connectToDatabase();
    await initRedisConnection();

    // Veritabanı modellerini senkronize ediyoruz
    await Player.sync(); // Burada tabloların oluşturulmasını sağlıyoruz

    // Seed verilerini ekliyoruz
    await seedData(); // Seed verileri burada çalıştırılıyor

    // Express uygulamasını oluşturuyoruz
    const app = createApp();
    const port = process.env.PORT || 3001;

    // Express sunucusunu başlatıyoruz
    app.listen(port, () => {
      console.log(`Sunucu ${port} numaralı portta çalışıyor.`);
    });
  } catch (error) {
    console.error("Sunucu başlatılırken bir hata oluştu:", error);
  }
})();
