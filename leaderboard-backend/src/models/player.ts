import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Player extends Model {
  public id!: number;
  public name!: string;
  public country!: string;
  public earnings!: number;
}

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
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "players",
  }
);

export default Player;
