import Router from "@koa/router";
import {
  addEmotionDiary,
  getEmotionalPage,
  deleteEmotional,
} from "../controllers/emotionDiaryController";
import authMiddleware from "../middleware/auth";

const emotionDiaryRouter = new Router({
  prefix: "/emotion-diary",
});

// 用户端 - 新增情绪日记
emotionDiaryRouter.post("/", authMiddleware(), addEmotionDiary);

// 管理端 - 分页查询
emotionDiaryRouter.get("/admin/page", authMiddleware(), getEmotionalPage);

// 管理端 - 删除
emotionDiaryRouter.delete("/admin/:id", authMiddleware(), deleteEmotional);

export default emotionDiaryRouter;
