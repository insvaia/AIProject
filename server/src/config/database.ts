import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// 添加非空断言或默认值处理
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;

if (!dbName || !dbUser || !dbPassword || !dbHost) {
  throw new Error("缺少必要的数据库环境变量，请检查 .env 文件");
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: parseInt(dbPort || "3306"),
  dialect: "mysql",
  logging: false,
});

export default sequelize;
