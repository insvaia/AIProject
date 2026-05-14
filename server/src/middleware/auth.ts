import { Context, Next } from "koa";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  username: string;
  userType: number;
}

// 扩展 Koa Context，附加用户信息
export interface AuthContext extends Context {
  currentUser?: JwtPayload;
}

const authMiddleware = () => {
  return async (ctx: AuthContext, next: Next) => {
    // 从 header 或 query 中获取 token
    const token =
      (ctx.headers.token as string) ||
      (ctx.headers.authorization as string)?.replace("Bearer ", "") ||
      (ctx.query.token as string);

    if (!token) {
      ctx.status = 200;
      ctx.body = {
        code: "401",
        message: "未登录或登录已过期",
      };
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key"
      ) as JwtPayload;
      ctx.currentUser = decoded;
      await next();
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        code: "401",
        message: "登录状态已过期，请重新登录",
      };
    }
  };
};

export default authMiddleware;
