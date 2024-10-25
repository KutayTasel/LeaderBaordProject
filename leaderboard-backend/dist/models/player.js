"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Player extends sequelize_1.Model {
}
// Player modelini tanımlıyoruz
Player.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    earnings: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0, // Varsayılan olarak 0 kazanç
    },
}, {
    sequelize: database_1.default, // Bu modelin kullanılacağı veritabanı bağlantısını veriyoruz
    tableName: "players", // MySQL'deki tablo adı
});
exports.default = Player;
