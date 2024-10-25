import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// .env dosyasındaki veritabanı bilgilerini kullanmak için dotenv'i yapılandırın
dotenv.config();

// Sequelize örneğini oluşturuyoruz, bu MySQL ile bağlantıyı kuracak
const sequelize = new Sequelize(
  process.env.DB_NAME || "leaderboard_db", // Veritabanı adı
  process.env.DB_USER || "root", // Kullanıcı adı
  process.env.DB_PASSWORD || "", // Şifre
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql", // MySQL ile çalıştığımızı belirtiyoruz
    port: Number(process.env.DB_PORT) || 3306,
    logging: false, // Konsolda SQL sorgularını görmemek için 'false' yapıyoruz
  }
);

// Bağlantının başarılı olup olmadığını kontrol edelim
export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL bağlantısı başarılı!");

    // Player tablosunu oluştur veya güncelle
    await sequelize.sync(); // Bu, tüm modellerin tablolarını oluşturur
  } catch (error) {
    console.error("Veritabanı bağlantısı başarısız:", error);
  }
};

export default sequelize;
