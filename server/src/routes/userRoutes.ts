import Router from "@koa/router";
import { register, login, logout } from "../controllers/userController";

const userRouter = new Router({
  prefix: "/user",
});

// 注册接口
userRouter.post("/add", register);

// 登录接口
userRouter.post("/login", login);

// 退出登录
userRouter.post("/logout", logout);

export default userRouter;
