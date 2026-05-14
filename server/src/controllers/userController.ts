import { Context } from "koa";
import { Op } from "sequelize";
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 注册用户
export const register = async (ctx: Context) => {
  try {
    const {
      username,
      email,
      nickname,
      phone,
      password,
      confirmPassword,
      gender,
      userType = 1,
    } = ctx.request.body as any;

    // 1. 参数校验
    if (
      !username ||
      !email ||
      !nickname ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "请填写所有必填字段",
      };
      return;
    }

    // 2. 校验密码和确认密码是否一致
    if (password !== confirmPassword) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "两次输入的密码不一致",
      };
      return;
    }

    // 3. 校验密码长度
    if (password.length < 6) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "密码长度不能少于6位",
      };
      return;
    }

    // 4. 校验手机号格式（简单校验）
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "手机号格式不正确",
      };
      return;
    }

    // 5. 校验邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "邮箱格式不正确",
      };
      return;
    }

    // 6. 校验性别（0 或未传时默认为 1）
    const finalGender = ![1, 2].includes(gender) ? 1 : gender;

    // 7. 检查用户名是否已存在
    const existUsername = await User.findOne({ where: { username } });
    if (existUsername) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "用户名已存在",
      };
      return;
    }

    // 8. 检查邮箱是否已存在
    const existEmail = await User.findOne({ where: { email } });
    if (existEmail) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "邮箱已被注册",
      };
      return;
    }

    // 9. 检查手机号是否已存在
    const existPhone = await User.findOne({ where: { phone } });
    if (existPhone) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "手机号已被注册",
      };
      return;
    }

    // 10. 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 11. 创建用户
    await User.create({
      username,
      email,
      nickname,
      phone,
      password: hashedPassword,
      gender: finalGender,
      userType,
    });

    // 12. 返回成功响应
    ctx.status = 201;
    ctx.body = {
      code: "200",
      message: "注册成功",
      data: {},
    };
  } catch (error) {
    console.error("注册失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "BUSINESS_ERROR",
      message: "注册失败，服务器内部错误",
    };
  }
};

// 登录
export const login = async (ctx: Context) => {
  try {
    const { username, password } = ctx.request.body as any;

    // 1. 参数校验
    if (!username || !password) {
      ctx.status = 200;
      ctx.body = {
        code: "400",
        message: "用户名和密码不能为空",
      };
      return;
    }

    // 2. 查询用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: username }, { email: username }],
      },
    });

    // 3. 检查用户是否存在
    if (!user) {
      ctx.status = 200;
      ctx.body = {
        code: "401",
        message: "用户名或密码错误",
      };
      return;
    }

    // 4. 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      ctx.status = 200;
      ctx.body = {
        code: "401",
        message: "用户名或密码错误",
      };
      return;
    }

    // 5. 生成 JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        userType: user.userType,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    );

    // 6. 返回用户信息（不包含密码）
    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "登录成功",
      data: {
        token,
        userInfo: {
          id: user.id,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          phone: user.phone,
          gender: user.gender,
          userType: user.userType,
        },
      },
    };
  } catch (error) {
    console.error("登录失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "500",
      message: "登录失败，服务器内部错误",
    };
  }
};

// 退出登录
export const logout = async (ctx: Context) => {
  ctx.status = 200;
  ctx.body = {
    code: "200",
    message: "退出登录成功",
  };
};
