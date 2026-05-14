import Koa from "koa";
import json from "koa-json";
import cors from "koa2-cors";
import bodyParser from "koa-body";
import staticCache from "koa-static-cache";
import path from "path";
import userRouter from "./routes/userRoutes";
import knowledgeRouter from "./routes/knowledgeRoutes";
import fileRouter from "./routes/fileRoutes";
import chatRouter from "./routes/chatRoutes";
import emotionDiaryRouter from "./routes/emotionDiaryRoutes";
import analyticsRouter from "./routes/analyticsRoutes";
import sequelize from "./config/database";
import dotenv from "dotenv";

dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 3000;

// 静态文件服务（上传的图片）
app.use(
  staticCache(path.join(__dirname, "../uploads"), {
    prefix: "/uploads",
    maxAge: 7 * 24 * 60 * 60,
    dynamic: true,
  })
);

// 中间件
app.use(cors());
app.use(json({ pretty: false, param: "pretty" }));
app.use(
  bodyParser({
    multipart: true,
  }),
);

// 路由
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());
app.use(knowledgeRouter.routes());
app.use(knowledgeRouter.allowedMethods());
app.use(fileRouter.routes());
app.use(fileRouter.allowedMethods());
app.use(chatRouter.routes());
app.use(chatRouter.allowedMethods());
app.use(emotionDiaryRouter.routes());
app.use(emotionDiaryRouter.allowedMethods());
app.use(analyticsRouter.routes());
app.use(analyticsRouter.allowedMethods());

// 测试路由
app.use(async (ctx) => {
  if (ctx.path === "/") {
    ctx.body = { message: "Koa + TypeScript + Sequelize API 服务已启动" };
  }
});

// 数据库连接并启动服务
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ 数据库连接成功");

    await sequelize.sync();
    console.log("✅ 模型同步完成");

    app.listen(PORT, () => {
      console.log(`🚀 服务运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ 数据库连接失败:", error);
  }
};

startServer();

export default app;
