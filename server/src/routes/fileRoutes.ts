import Router from "@koa/router";
import { uploadFile } from "../controllers/fileController";
import authMiddleware from "../middleware/auth";

const fileRouter = new Router({
  prefix: "/file",
});

fileRouter.post("/upload", authMiddleware(), uploadFile);

export default fileRouter;
