import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Player extends Model {
  public id!: number;
  public name!: string;
  public country!: string;
  public earnings!: number;
}

// Player modelini tanımlıyoruz
Player.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    earnings: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0, // Varsayılan olarak 0 kazanç
    },
  },
  {
    sequelize, // Bu modelin kullanılacağı veritabanı bağlantısını veriyoruz
    tableName: "players", // MySQL'deki tablo adı
  }
);

export default Player;
