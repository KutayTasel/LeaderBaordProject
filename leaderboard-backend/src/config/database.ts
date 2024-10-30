import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "leaderboard_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "51.20.78.86",
    dialect: "mysql",
    port: Number(process.env.DB_PORT) || 3306,
    logging: false,
  }
);

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL bağlantısı başarılı!");
    await sequelize.sync();
  } catch (error) {
    console.error("Veritabanı bağlantısı başarısız:", error);
  }
};

export default sequelize;
