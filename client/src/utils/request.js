import axios from "axios";
import { ElMessage } from "element-plus";

const service = axios.create({
  baseURL: "/api", // 请求的前缀
  timeout: 5000, // 请求超时时间
});

// 短时间内的多个 401/403 只提示一次
// (如同一页面 onMounted 并行发多个请求,全部失败时会同时触发拦截器;
//  窗口放宽到 10s,覆盖慢请求晚到的情况)
let lastAuthNoticeAt = 0;
const AUTH_NOTICE_WINDOW = 10000;

// 登录失效统一处理:清状态 + 提示 + 跳登录页(登录接口本身除外)
const handleAuthExpired = (config, msg) => {
  const url = config?.url || "";
  // 登录接口自己报 401/403 = 账号密码不对,只提示不跳转
  if (url.includes("/login")) {
    ElMessage.error(msg || "用户名或密码错误");
    return;
  }
  const now = Date.now();
  if (now - lastAuthNoticeAt >= AUTH_NOTICE_WINDOW) {
    lastAuthNoticeAt = now;
    ElMessage.error(msg || "请先登录");
  }
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  if (window.location.pathname !== "/auth/login") {
    import("@/router")
      .then((m) => m.default.push("/auth/login"))
      .catch(() => {
        window.location.href = "/auth/login";
      });
  }
};

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data, config } = response;
    if (data.code === "200") {
      return data.data;
    }
    // 业务层约定:code -1 / 401 = 未登录或登录过期(本地后端约定)
    if (data.code === "-1" || data.code === "401") {
      handleAuthExpired(config, data.msg);
      if (config.url?.includes("/login")) {
        return Promise.reject(data.msg || "登录状态已过期，请重新登录");
      }
    }
    return response;
  },
  (error) => {
    // HTTP 层错误:401/403 = 未登录、登录过期或无权限(线上后端/网关约定)
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      handleAuthExpired(error.config);
    }
    return Promise.reject(error);
  },
);

export default service;
