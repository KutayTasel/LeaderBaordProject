"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
// .env dosyasındaki veritabanı bilgilerini kullanmak için dotenv'i yapılandırın
dotenv_1.default.config();
// Sequelize örneğini oluşturuyoruz, bu MySQL ile bağlantıyı kuracak
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || "leaderboard_db", // Veritabanı adı
process.env.DB_USER || "root", // Kullanıcı adı
process.env.DB_PASSWORD || "", // Şifre
{
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql", // MySQL ile çalıştığımızı belirtiyoruz
    port: Number(process.env.DB_PORT) || 3306,
    logging: false, // Konsolda SQL sorgularını görmemek için 'false' yapıyoruz
});
// Bağlantının başarılı olup olmadığını kontrol edelim
const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL bağlantısı başarılı!");
        // Player tablosunu oluştur veya güncelle
        await sequelize.sync(); // Bu, tüm modellerin tablolarını oluşturur
    }
    catch (error) {
        console.error("Veritabanı bağlantısı başarısız:", error);
    }
};
exports.connectToDatabase = connectToDatabase;
exports.default = sequelize;
