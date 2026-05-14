import Router from "@koa/router";
import {
  startSession,
  getSessionPageList,
  getSessionMessages,
  deleteSession,
  getSessionEmotion,
  streamChat,
} from "../controllers/chatController";
import authMiddleware from "../middleware/auth";

const chatRouter = new Router({
  prefix: "/psychological-chat",
});

// 启动新会话
chatRouter.post("/session/start", authMiddleware(), startSession);

// 会话分页列表
chatRouter.get("/sessions", authMiddleware(), getSessionPageList);

// 会话消息
chatRouter.get("/sessions/:sessionId/messages", getSessionMessages);

// 删除会话
chatRouter.delete("/sessions/:sessionId", authMiddleware(), deleteSession);

// 会话情绪分析
chatRouter.get("/session/:sessionId/emotion", getSessionEmotion);

// SSE 流式对话
chatRouter.post("/stream", authMiddleware(), streamChat);

export default chatRouter;
